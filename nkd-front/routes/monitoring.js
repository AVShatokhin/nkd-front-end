var express = require("express");
var router = express.Router();
var nkd = require("../libs/nkd.js");
const { ClickHouse } = require("clickhouse");

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

  // sql =
  //   `select date(ts) as day, hour(ts) as h, avg(signal1) as as1, min(signal1) as ms1, max(signal1) as mas1, min(moto) as m ` +
  //   `from signals_by_ts ` +
  //   `where ts between '${fromRange}' and '${toRange}' ` +
  //   `group by day, h ` +
  //   `order by m;`;

  ans["second_ordinat"] = req.query.second_ordinat;
  ans["active_gear"] = req.query.active_gear;
  ans["speed_zone"] = req.query.speed_zone;
  ans["fromRange"] = fromRange;
  ans["toRange"] = toRange;

  let cnt = await getCountQuery(
    `select count(*) as cnt from signals_by_ts where ts between '${fromRange}' and '${toRange}';`
  );

  if (cnt < 20000) {
    // Нет агрегации данных, пишем все точки в том виде как они есть без усреднений
    ans.currentAgregation = 1;

    let sql =
      `select toUnixTimestamp(ts) as tst, round(signal1, 4) as s1, round(signal2, 4) as s2, round(signal3, 4) as s3, round(tacho, 4) as tacho, round(speed, 1) as speed ` +
      `from signals_by_ts ` +
      `where ts between '${fromRange}' and '${toRange}'` +
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
  } else if (cnt >= 20000 && cnt <= 500000) {
    // агрегируем по часам
    ans.currentAgregation = 60;

    let sql =
      `select date(ts) as day, hour(ts) as h, round(avg(toUnixTimestamp(ts)),0) as tst, ` +
      `round(avg(signal1), 4) as s1, round(avg(signal2), 4) as s2, round(avg(signal3), 4) as s3, ` +
      `round(min(signal1), 4) as mn1, round(min(signal2), 4) as mn2, round(min(signal3), 4) as mn3, ` +
      `round(max(signal1), 4) as mx1, round(max(signal2), 4) as mx2, round(max(signal3), 4) as mx3 ` +
      `from signals_by_ts ` +
      `where ts between '${fromRange}' and '${toRange}' ` +
      `group by day, h ` +
      `order by tst;`;
    // console.log(sql);
    await getQuery(sql, ans, (data) => {
      // console.log(data);
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
      ]);
    });
  } else if (cnt >= 500000 && cnt < 2500000) {
    // агрегируем по дням

    ans.currentAgregation = 24 * 60;

    let sql =
      `select date(ts) as day, round(avg(toUnixTimestamp(ts)),0) as tst, ` +
      `round(avg(signal1), 4) as s1, round(avg(signal2), 4) as s2, round(avg(signal3), 4) as s3, ` +
      `round(min(signal1), 4) as mn1, round(min(signal2), 4) as mn2, round(min(signal3), 4) as mn3, ` +
      `round(max(signal1), 4) as mx1, round(max(signal2), 4) as mx2, round(max(signal3), 4) as mx3 ` +
      `from signals_by_ts ` +
      `where ts between '${fromRange}' and '${toRange}' ` +
      `group by day ` +
      `order by tst;`;
    // console.log(sql);
    await getQuery(sql, ans, (data) => {
      // console.log(data);
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
      ]);
    });
  } else if (cnt >= 2500000) {
    // агрегируем по дням

    ans.currentAgregation = 24 * 60 * 12;

    let sql =
      `select year(ts) as year, month(ts) as month, round(avg(toUnixTimestamp(ts)),0) as tst, ` +
      `round(avg(signal1), 4) as s1, round(avg(signal2), 4) as s2, round(avg(signal3), 4) as s3, ` +
      `round(min(signal1), 4) as mn1, round(min(signal2), 4) as mn2, round(min(signal3), 4) as mn3, ` +
      `round(max(signal1), 4) as mx1, round(max(signal2), 4) as mx2, round(max(signal3), 4) as mx3 ` +
      `from signals_by_ts ` +
      `where ts between '${fromRange}' and '${toRange}' ` +
      `group by year, month ` +
      `order by tst;`;
    // console.log(sql);
    await getQuery(sql, ans, (data) => {
      // console.log(data);
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
      ]);
    });
  }

  ans.stopTime = new Date().getTime();
  ans.size = JSON.stringify(ans).length;
  ans.count = ans.data.length;
  ans.status.success = true;
  // console.log(ans);
  res.json(ans);
});

async function getQuery(sql, ans, dataProcced) {
  return new Promise((resolve) => {
    let clickhouse = connectClickhouse(2);
    clickhouse
      .query(sql)
      .stream()
      .on("data", function (data) {
        if (ans.startTS == undefined) {
          ans.startTS = data.tst;
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
    let clickhouse = connectClickhouse(3);
    clickhouse
      .query(sql)
      .stream()
      .on("data", function (data) {
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
