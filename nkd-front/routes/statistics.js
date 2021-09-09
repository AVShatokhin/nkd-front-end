var express = require("express");
var router = express.Router();
var nkd = require("../libs/nkd.js");
var config = require("../libs/config.js");

// var config = require("../libs/config.js");
// const gost = config.openConfigFile("gost_iso_10816_1_97");
const signals = config.openConfigFile("signals");

router.get("/get_moto_data_by_jquery", async function (req, res, next) {
  let length = req.query.length;
  let start = req.query.start;
  let draw = req.query.draw;

  let moto_begin =
    (req.query.input__moto_begin * 3600) / signals.cnt.moto_factor;
  let moto_end = (req.query.input__moto_end * 3600) / signals.cnt.moto_factor;

  let speed_zone_sql = "";

  if (req.query.speed_zone > 0) {
    speed_zone_sql = ` and freq > ${
      signals.tacho.speed_zones[req.query.speed_zone].begin
    } and freq <= ${signals.tacho.speed_zones[req.query.speed_zone].end}`;
  }

  let ans = {
    draw,
    data: [],
  };

  if (!nkd.check_role(req, "admin")) {
    res.json(ans);
    return;
  }

  ans.recordsTotal = await new Promise((resolve) => {
    connection.query(
      `select count(*) as cnt from diagn_history where moto > ? and moto < ? ${speed_zone_sql};`,
      [moto_begin, moto_end],
      (err, result) => {
        if (err != undefined) {
          console.log(err);
          resolve(undefined); // ошибка при работе с базой
        } else {
          resolve(result[0].cnt);
        }
      }
    );
  });

  ans.recordsFiltered = ans.recordsTotal;

  ans.data = await new Promise((resolve) => {
    connection.query(
      `select did, lts, UNIX_TIMESTAMP(calc_ts) as calc_ts, UNIX_TIMESTAMP(record_ts) as record_ts, active_gear, moto, freq, mode, content` +
        ` from diagn_history where ` +
        ` moto > ? and moto < ? ` +
        ` ${speed_zone_sql} ` +
        ` order by record_ts limit ${start}, ${length};`,
      [moto_begin, moto_end],
      (err, result) => {
        if (err != undefined) {
          console.log(err);
          resolve(undefined); // ошибка при работе с базой
        } else {
          if (result.length != 0) {
            let __data = [];
            result.forEach((e) => {
              __data.push([
                JSON.stringify({
                  did: e.did,
                  lts: e.lts,
                  calc_ts: e.calc_ts,
                  record_ts: e.record_ts,
                  active_gear: e.active_gear,
                  moto: e.moto,
                  freq: e.freq,
                  mode: e.mode,
                  content: e.content,
                }),
                0,
                // e.content,
              ]);
            });

            resolve(__data); // получили результат из базы
          } else {
            resolve([]); // не нашлось ничего в базе
          }
        }
      }
    );
  });

  console.log(moto_begin);
  console.log(moto_end);
  console.log(ans);
  res.json(ans);
});

router.get("/get_data_by_jquery", async function (req, res, next) {
  let length = req.query.length;
  let start = req.query.start;
  let draw = req.query.draw;

  let ans = {
    draw,
    data: [],
  };

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

  let active_gear_sql = "";

  if (req.query.active_gear == 0) {
    active_gear_sql = " and active_gear=0 ";
  } else if (req.query.active_gear == 1) {
    active_gear_sql = " and active_gear=1 ";
  }

  let speed_zone_sql = "";

  if (req.query.speed_zone > 0) {
    speed_zone_sql = ` and freq > ${
      signals.tacho.speed_zones[req.query.speed_zone].begin
    } and freq <= ${signals.tacho.speed_zones[req.query.speed_zone].end}`;
  }

  ans.recordsTotal = await new Promise((resolve) => {
    connection.query(
      `select count(*) as cnt from diagn_history where record_ts > ? and record_ts < ? ${active_gear_sql} ${speed_zone_sql};`,
      [fromRange, toRange],
      (err, result) => {
        if (err != undefined) {
          console.log(err);
          resolve(undefined); // ошибка при работе с базой
        } else {
          resolve(result[0].cnt);
        }
      }
    );
  });

  ans.recordsFiltered = ans.recordsTotal;

  ans.data = await new Promise((resolve) => {
    connection.query(
      `select did, lts, UNIX_TIMESTAMP(calc_ts) as calc_ts, UNIX_TIMESTAMP(record_ts) as record_ts, active_gear, moto, freq, mode, content` +
        ` from diagn_history where ` +
        ` record_ts > ? and record_ts < ? ` +
        ` ${active_gear_sql} ` +
        ` ${speed_zone_sql} ` +
        ` order by record_ts limit ${start}, ${length};`,
      [fromRange, toRange],
      (err, result) => {
        if (err != undefined) {
          console.log(err);
          resolve(undefined); // ошибка при работе с базой
        } else {
          if (result.length != 0) {
            let __data = [];
            result.forEach((e) => {
              __data.push([
                JSON.stringify({
                  did: e.did,
                  lts: e.lts,
                  calc_ts: e.calc_ts,
                  record_ts: e.record_ts,
                  active_gear: e.active_gear,
                  moto: e.moto,
                  freq: e.freq,
                  mode: e.mode,
                }),
                e.content,
              ]);
            });

            resolve(__data); // получили результат из базы
          } else {
            resolve([]); // не нашлось ничего в базе
          }
        }
      }
    );
  });
  res.json(ans);
});

// router.get("/get_stat111", async function (req, res, next) {
//   let speed_zone_sql = "";

//   if (req.query.speed_zone == 1) {
//     speed_zone_sql = " and speed=1 ";
//   } else if (req.query.speed_zone == 2.4) {
//     speed_zone_sql = " and speed=2.4 ";
//   } else if (req.query.speed_zone == 4) {
//     speed_zone_sql = " and speed=4 ";
//   } else if (req.query.speed_zone == 5) {
//     speed_zone_sql = " and speed=5 ";
//   }

//   ans.stopTime = new Date().getTime();
//   ans.count = ans.data.length;
//   ans.status.success = true;
//   res.json(ans);
// });

let connection;
function setConnection(c) {
  connection = c;
}

module.exports = router;
module.exports.setConnection = setConnection;
