var express = require("express");
var router = express.Router();
var nkd = require("../libs/nkd.js");
const { ClickHouse } = require("clickhouse");
var config = require("../libs/config.js");
const gost = config.openConfigFile("gost_iso_10816_1_97");
const signals = config.openConfigFile("signals");

router.get("/get_stat", async function (req, res, next) {
  let ans = {
    status: {
      success: false,
    },
    data: [],
  };

  ans.startTime = new Date().getTime();

  if (!nkd.check_role(req, "admin")) {
    res.json(ans);
    return;
  }

  let range = req.query.input__request_dateTimeRange;
  let [fromRange, toRange] = range.split(" - ");

  if (
    (range == undefined) |
    (fromRange == undefined) |
    (toRange == undefined)
  ) {
    res.json(ans);
    return;
  }

  ans["second_ordinat"] = req.query.second_ordinat;
  ans["first_ordinat"] = req.query.first_ordinat;
  ans["active_gear"] = req.query.active_gear;
  ans["speed_zone"] = req.query.speed_zone;
  ans["fromRange"] = fromRange;
  ans["toRange"] = toRange;
  ans["gost"] = gost;
  ans["signals"] = signals;

  let active_gear_sql = "";

  if (req.query.active_gear == 0) {
    active_gear_sql = " and active_gear=0 ";
  } else if (req.query.active_gear == 1) {
    active_gear_sql = " and active_gear=1 ";
  }

  let speed_zone_sql = "";

  if (req.query.speed_zone == 1) {
    speed_zone_sql = " and speed=1 ";
  } else if (req.query.speed_zone == 2.4) {
    speed_zone_sql = " and speed=2.4 ";
  } else if (req.query.speed_zone == 4) {
    speed_zone_sql = " and speed=4 ";
  } else if (req.query.speed_zone == 5) {
    speed_zone_sql = " and speed=5 ";
  }

  let cnt = await getCountQuery(
    `select count(*) as cnt from signals_by_ts where ts between '${fromRange}' and '${toRange}' ${active_gear_sql} ${active_gear_sql} ${speed_zone_sql};`
  );

  // console.log(cnt);

  if (cnt <= 2 * 8640) {
    // сутки при минимальном периоде 6 * 60 * 24 = 8640
    // Нет агрегации данных, пишем все точки в том виде как они есть без усреднений
    ans.currentAgregation = 1;

    let sql =
      `select toUnixTimestamp(ts) as tst, round(signal1, 4) as s1, round(signal2, 4) as s2, round(signal3, 4) as s3, round(tacho, 1) as tacho, round(speed, 1) as speed ` +
      `from signals_by_ts ` +
      `where ts between '${fromRange}' and '${toRange}'` +
      active_gear_sql +
      speed_zone_sql +
      `order by ts;`;

    await getQuery(sql, ans, (data) => {
      ans.data.push([
        data.tst - ans.startTS,
        data.s1,
        data.s2,
        data.s3,
        data.tacho,
        data.speed,
      ]);
    });
  } else if (cnt > 2 * 8640 && cnt <= 100000) {
    // агрегируем по часам
    ans.currentAgregation = 60;

    let sql =
      `select date(ts) as day, hour(ts) as h, round(avg(toUnixTimestamp(ts)),0) as tst, ` +
      `round(avg(signal1), 4) as s1, round(avg(signal2), 4) as s2, round(avg(signal3), 4) as s3, ` +
      `round(min(signal1), 4) as mn1, round(min(signal2), 4) as mn2, round(min(signal3), 4) as mn3, ` +
      `round(max(signal1), 4) as mx1, round(max(signal2), 4) as mx2, round(max(signal3), 4) as mx3, ` +
      `round(max(tacho), 1) as mxf, round(min(tacho), 1) as mnf, round(avg(tacho), 1) as t, ` +
      `round(max(speed), 1) as mxs, round(min(speed), 1) as mns, round(avg(speed), 1) as s ` +
      `from signals_by_ts ` +
      `where ts between '${fromRange}' and '${toRange}' ` +
      active_gear_sql +
      speed_zone_sql +
      `group by day, h ` +
      `order by tst;`;

    // console.log(sql);

    await getQuery(sql, ans, (data) => {
      ans.data.push([
        data.tst - ans.startTS,
        data.s1,
        data.mn1,
        data.mx1,
        data.s2,
        data.mn2,
        data.mx2,
        data.s3,
        data.mn3,
        data.mx3,
        data.t,
        data.mnf,
        data.mxf,
        data.s,
        data.mns,
        data.mxs,
      ]);
    });
  } else if (cnt > 100000 && cnt <= 2500000) {
    // агрегируем по дням

    ans.currentAgregation = 24 * 60;

    let sql =
      `select date(ts) as day, round(avg(toUnixTimestamp(ts)),0) as tst, ` +
      `round(avg(signal1), 4) as s1, round(avg(signal2), 4) as s2, round(avg(signal3), 4) as s3, ` +
      `round(min(signal1), 4) as mn1, round(min(signal2), 4) as mn2, round(min(signal3), 4) as mn3, ` +
      `round(max(signal1), 4) as mx1, round(max(signal2), 4) as mx2, round(max(signal3), 4) as mx3, ` +
      `round(max(tacho), 1) as mxf, round(min(tacho), 1) as mnf, round(avg(tacho), 1) as t, ` +
      `round(max(speed), 1) as mxs, round(min(speed), 1) as mns, round(avg(speed), 1) as s ` +
      `from signals_by_ts ` +
      `where ts between '${fromRange}' and '${toRange}' ` +
      active_gear_sql +
      speed_zone_sql +
      `group by day ` +
      `order by tst;`;

    await getQuery(sql, ans, (data) => {
      ans.data.push([
        data.tst - ans.startTS,
        data.s1,
        data.mn1,
        data.mx1,
        data.s2,
        data.mn2,
        data.mx2,
        data.s3,
        data.mn3,
        data.mx3,
        data.t,
        data.mnf,
        data.mxf,
        data.s,
        data.mns,
        data.mxs,
      ]);
    });
  } else if (cnt > 2500000) {
    // агрегируем по месяцам

    ans.currentAgregation = Math.round(24 * 60 * 30.41);

    let sql =
      `select year(ts) as year, month(ts) as month, round(avg(toUnixTimestamp(ts)),0) as tst, ` +
      `round(avg(signal1), 4) as s1, round(avg(signal2), 4) as s2, round(avg(signal3), 4) as s3, ` +
      `round(min(signal1), 4) as mn1, round(min(signal2), 4) as mn2, round(min(signal3), 4) as mn3, ` +
      `round(max(signal1), 4) as mx1, round(max(signal2), 4) as mx2, round(max(signal3), 4) as mx3, ` +
      `round(max(tacho), 1) as mxf, round(min(tacho), 1) as mnf, round(avg(tacho), 1) as t, ` +
      `round(max(speed), 1) as mxs, round(min(speed), 1) as mns, round(avg(speed), 1) as s ` +
      `from signals_by_ts ` +
      `where ts between '${fromRange}' and '${toRange}' ` +
      active_gear_sql +
      speed_zone_sql +
      `group by year, month ` +
      `order by tst;`;

    await getQuery(sql, ans, (data) => {
      ans.data.push([
        data.tst - ans.startTS,
        data.s1,
        data.mn1,
        data.mx1,
        data.s2,
        data.mn2,
        data.mx2,
        data.s3,
        data.mn3,
        data.mx3,
        data.t,
        data.mnf,
        data.mxf,
        data.s,
        data.mns,
        data.mxs,
      ]);
    });
  }

  ans.stopTime = new Date().getTime();
  ans.size = JSON.stringify(ans).length;
  ans.count = ans.data.length;
  ans.status.success = true;
  res.json(ans);
});

router.get("/get_stat_moto", async function (req, res, next) {
  let ans = {
    status: {
      success: false,
    },
    data: [],
  };

  ans.startTime = new Date().getTime();

  if (!nkd.check_role(req, "admin")) {
    res.json(ans);
    return;
  }

  let fromRange = Math.round(
    (req.query.input__moto_begin * 3600) / signals.cnt.moto_factor
  );
  let toRange = Math.round(
    (req.query.input__moto_end * 3600) / signals.cnt.moto_factor
  );

  if ((fromRange == undefined) | (toRange == undefined)) {
    res.json(ans);
    return;
  }

  ans["second_ordinat"] = req.query.second_ordinat;
  ans["first_ordinat"] = req.query.first_ordinat;
  // ans["active_gear"] = req.query.active_gear;
  ans["speed_zone"] = req.query.speed_zone;
  ans["fromRange"] = fromRange;
  ans["toRange"] = toRange;
  ans["gost"] = gost;
  ans["signals"] = signals;

  // let active_gear_sql = "";

  // if (req.query.active_gear == 0) {
  //   active_gear_sql = " and active_gear=0 ";
  // } else if (req.query.active_gear == 1) {
  //   active_gear_sql = " and active_gear=1 ";
  // }

  let speed_zone_sql = "";

  if (req.query.speed_zone == 1) {
    speed_zone_sql = " and speed=1 ";
  } else if (req.query.speed_zone == 2.4) {
    speed_zone_sql = " and speed=2.4 ";
  } else if (req.query.speed_zone == 4) {
    speed_zone_sql = " and speed=4 ";
  } else if (req.query.speed_zone == 5) {
    speed_zone_sql = " and speed=5 ";
  }

  let cnt = await getCountQuery(
    `select count(*) as cnt from signals_by_ts where moto between '${fromRange}' and '${toRange}' ${speed_zone_sql};`
  );

  console.log(cnt);

  if (cnt > 0 && cnt <= 2 * 8640) {
    // сутки при минимальном периоде 6 * 60 * 24 = 8640
    // Нет агрегации данных, пишем все точки в том виде как они есть без усреднений
    ans.currentAgregation = 1;

    let sql =
      `select moto, active_gear, round(signal1, 4) as s1, round(signal2, 4) as s2, round(signal3, 4) as s3, round(tacho, 1) as tacho, round(speed, 1) as speed ` +
      `from signals_by_ts ` +
      `where moto between '${fromRange}' and '${toRange}' ` +
      // active_gear_sql +
      speed_zone_sql +
      `order by ts;`;

    await getQuery(sql, ans, (data) => {
      ans.data.push([
        calcMoto(data.moto) - ans.startMoto,
        data.active_gear,
        data.s1,
        data.s2,
        data.s3,
        data.tacho,
        data.speed,
      ]);
    });
  } else if (cnt > 2 * 8640 && cnt <= 100000) {
    // агрегируем по часам
    ans.currentAgregation = 60;

    let sql =
      `select date(ts) as day, hour(ts) as h, round(avg(toUnixTimestamp(ts)),0) as tst, ` +
      `round(avg(signal1), 4) as s1, round(avg(signal2), 4) as s2, round(avg(signal3), 4) as s3, ` +
      `round(min(signal1), 4) as mn1, round(min(signal2), 4) as mn2, round(min(signal3), 4) as mn3, ` +
      `round(max(signal1), 4) as mx1, round(max(signal2), 4) as mx2, round(max(signal3), 4) as mx3, ` +
      `round(max(tacho), 1) as mxf, round(min(tacho), 1) as mnf, round(avg(tacho), 1) as t, ` +
      `round(max(speed), 1) as mxs, round(min(speed), 1) as mns, round(avg(speed), 1) as s ` +
      `from signals_by_ts ` +
      `where ts between '${fromRange}' and '${toRange}' ` +
      active_gear_sql +
      speed_zone_sql +
      `group by day, h ` +
      `order by tst;`;

    // console.log(sql);

    await getQuery(sql, ans, (data) => {
      ans.data.push([
        data.tst - ans.startTS,
        data.s1,
        data.mn1,
        data.mx1,
        data.s2,
        data.mn2,
        data.mx2,
        data.s3,
        data.mn3,
        data.mx3,
        data.t,
        data.mnf,
        data.mxf,
        data.s,
        data.mns,
        data.mxs,
      ]);
    });
  } else if (cnt > 100000 && cnt <= 2500000) {
    // агрегируем по дням

    ans.currentAgregation = 24 * 60;

    let sql =
      `select date(ts) as day, round(avg(toUnixTimestamp(ts)),0) as tst, ` +
      `round(avg(signal1), 4) as s1, round(avg(signal2), 4) as s2, round(avg(signal3), 4) as s3, ` +
      `round(min(signal1), 4) as mn1, round(min(signal2), 4) as mn2, round(min(signal3), 4) as mn3, ` +
      `round(max(signal1), 4) as mx1, round(max(signal2), 4) as mx2, round(max(signal3), 4) as mx3, ` +
      `round(max(tacho), 1) as mxf, round(min(tacho), 1) as mnf, round(avg(tacho), 1) as t, ` +
      `round(max(speed), 1) as mxs, round(min(speed), 1) as mns, round(avg(speed), 1) as s ` +
      `from signals_by_ts ` +
      `where ts between '${fromRange}' and '${toRange}' ` +
      active_gear_sql +
      speed_zone_sql +
      `group by day ` +
      `order by tst;`;

    await getQuery(sql, ans, (data) => {
      ans.data.push([
        data.tst - ans.startTS,
        data.s1,
        data.mn1,
        data.mx1,
        data.s2,
        data.mn2,
        data.mx2,
        data.s3,
        data.mn3,
        data.mx3,
        data.t,
        data.mnf,
        data.mxf,
        data.s,
        data.mns,
        data.mxs,
      ]);
    });
  } else if (cnt > 2500000) {
    // агрегируем по месяцам

    ans.currentAgregation = Math.round(24 * 60 * 30.41);

    let sql =
      `select year(ts) as year, month(ts) as month, round(avg(toUnixTimestamp(ts)),0) as tst, ` +
      `round(avg(signal1), 4) as s1, round(avg(signal2), 4) as s2, round(avg(signal3), 4) as s3, ` +
      `round(min(signal1), 4) as mn1, round(min(signal2), 4) as mn2, round(min(signal3), 4) as mn3, ` +
      `round(max(signal1), 4) as mx1, round(max(signal2), 4) as mx2, round(max(signal3), 4) as mx3, ` +
      `round(max(tacho), 1) as mxf, round(min(tacho), 1) as mnf, round(avg(tacho), 1) as t, ` +
      `round(max(speed), 1) as mxs, round(min(speed), 1) as mns, round(avg(speed), 1) as s ` +
      `from signals_by_ts ` +
      `where ts between '${fromRange}' and '${toRange}' ` +
      active_gear_sql +
      speed_zone_sql +
      `group by year, month ` +
      `order by tst;`;

    await getQuery(sql, ans, (data) => {
      ans.data.push([
        data.tst - ans.startTS,
        data.s1,
        data.mn1,
        data.mx1,
        data.s2,
        data.mn2,
        data.mx2,
        data.s3,
        data.mn3,
        data.mx3,
        data.t,
        data.mnf,
        data.mxf,
        data.s,
        data.mns,
        data.mxs,
      ]);
    });
  }

  ans.stopTime = new Date().getTime();
  ans.size = JSON.stringify(ans).length;
  ans.count = ans.data.length;
  ans.status.success = true;
  res.json(ans);
});

function calcMoto(moto_impulse) {
  return (signals.cnt.moto_factor * moto_impulse) / 3600; // выдаём мото часы
}

async function getQuery(sql, ans, dataProcced) {
  return new Promise((resolve) => {
    let clickhouse = connectClickhouse(Math.random(1));
    clickhouse
      .query(sql)
      .stream()
      .on("data", function (data) {
        if (ans.startTS == undefined) {
          ans.startTS = data.tst;
        }

        if (ans.startMoto == undefined) {
          ans.startMoto = calcMoto(data.moto);
        }

        dataProcced(data);
      })
      .on("error", (err) => {
        console.log(err);
        resolve(false);
      })
      .on("end", () => {
        // console.log("END");
        resolve(true);
      });
  });
}

async function getCountQuery(sql) {
  let cnt;
  return new Promise((resolve) => {
    let clickhouse = connectClickhouse(Math.random(1));
    clickhouse
      .query(sql)
      .stream()
      .on("data", function (data) {
        // console.log(data);
        cnt = data.cnt;
      })
      .on("error", (err) => {
        console.log(err);
        resolve(undefined);
      })
      .on("end", () => {
        resolve(cnt);
      });
  });
}

function connectClickhouse(session_id) {
  return new ClickHouse({
    url: conf.get("ch_url"),
    port: conf.get("ch_port"),
    debug: false,
    basicAuth: null,
    isUseGzip: false,
    format: "json", // "json" || "csv" || "tsv"
    raw: false,
    config: {
      session_id: session_id,
      session_timeout: 60,
      output_format_json_quote_64bit_integers: 0,
      enable_http_compression: 0,
      database: conf.get("ch_name"),
    },
  });
}

let conf;
function setConfig(c) {
  conf = c;
}

module.exports = router;
module.exports.setConfig = setConfig;
