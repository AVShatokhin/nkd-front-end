var config = require("../../libs/config.js");
var nkd = require("../../libs/nkd.js");

const dresult_render = require("../../libs/classes/dresult_render.js");
const object_parser = require("../../libs/classes/object_parser.js");

var express = require("express");
var router = express.Router();
const EventEmitter = require("events");
class MyEmitter extends EventEmitter {}
const myEmitter = new MyEmitter();
const { ClickHouse } = require("clickhouse");
const nodemailer = require("nodemailer");

const signals_config = config.openConfigFile("signals");
const gost = config.openConfigFile("gost_iso_10816_1_97");

let configs;

router.get("/get_config", async function (req, res, next) {
  let ans = {
    status: {
      success: true,
      auth: true,
    },
    data: await config.openMainConfig(connection),
  };

  ans.data["options_changed_ts"] = current.getDataByLink("options_changed_ts");

  let __object_parser = new object_parser({
    configs: { savedNode: ans.data.savedNode },
  });

  ans.data.objectHash = __object_parser.objectHash;

  res.json(ans);
});

router.get("/get_current", function (req, res, next) {
  let c = current.getAllData();

  let ans = {
    status: {
      success: false,
    },
    data: [],
  };

  if (req.query.link != undefined) {
    if (req.query.link in c) {
      ans.status.success = true;
      ans.data = [c[req.query.link]];
    }
  } else {
    ans.status.success = true;
    ans.data = [c];
  }

  res.json(ans);
});

router.post("/income/", async function (req, res, next) {
  let ans = {
    status: {
      success: false,
    },
    data: {},
  };

  if ("signals" in req.body) {
    ans.status.success = true;
    insert(dataSeriesProcceed(req));
    lastElementProcceed(req);
    myEmitter.emit("signals");
  }

  if ("diagn" in req.body) {
    req.body.diagn.active_gear = current.getActiveGear();
    req.body.diagn.moto = current.getMoto(req.body.diagn.active_gear);
    req.body.diagn.speed_zone = calcSpeedZone(req.body.diagn.freq);
    req.body.diagn.freq = Math.round(req.body.diagn.freq * 100) / 100;
    current.updateData("diagn", req.body.diagn);
    await DIAGN_statisticWrite(connection, ans, req.body.diagn);
    myEmitter.emit("diagn");
    await DIAGN_sendEmails(connection, req.body.diagn);
  }

  ans.data["options_changed_ts"] = current.getDataByLink("options_changed_ts");
  ans.data["cmd"] = current.getDataByLink("cmd");

  // console.log(ans);

  res.json(ans);
});

async function DIAGN_sendEmails(connection, diagn) {
  let app_name = configs.config.app_name;

  let __users = await getUsers(connection);

  let r = new dresult_render({
    configs,
    diagn,
  });

  // console.log(r.html);

  __users.forEach((e) => {
    if (e.spam == "on") {
      let __opt = {
        from: `"Система вибродиагностики" <${conf.get("smtp_user")}>`,
        to: e.email,
        subject: `${app_name}: получены результаты диагностической процедуры [${Math.random()}]`,
        html: r.html,
      };

      transporter.sendMail(__opt);
    }
  });
}

async function getUsers(connection) {
  return new Promise((resolve) =>
    connection.query(
      `select uid, name, second_name, surname, ava, phone, address, email, role, spam from users order by uid`,
      [],
      (err, result) => {
        if (err != undefined) {
          console.log(err);
          resolve({ error: err });
        } else {
          resolve(result);
        }
      }
    )
  );
}

async function DIAGN_statisticWrite(connection, ans, diagn) {
  return new Promise((resolve) => {
    connection.query(
      "insert into diagn_history set calc_ts=FROM_UNIXTIME(?), record_ts=FROM_UNIXTIME(?), active_gear=?, moto=?, freq=?, mode=?, content=?, record_url=?;",
      [
        diagn.calc_ts,
        diagn.record_ts,
        diagn.active_gear,
        diagn.moto,
        diagn.freq,
        diagn.mode,
        JSON.stringify(diagn.content),
        diagn.record_url,
      ],
      (err, res) => {
        nkd.proceed(ans, err, res);
        resolve(ans);
      }
    );
  });
}

async function insert(data) {
  let clickhouse = connectClickhouse("income");
  const ws = clickhouse
    .insert(
      "INSERT INTO signals_by_ts (ts, active_gear, speed, moto, tacho, signal1, signal2, signal3) values "
    )
    .stream();

  await ws.writeRow(data).catch((err) => {
    console.log("ERROR writeRow err: " + err);
    console.log("ERROR writeRow data: " + data);
  });

  return await ws.exec().catch((err) => {
    console.log("ERROR exec err: " + err);
    console.log("ERROR exec data: " + data);
  });
}

function dataSeriesProcceed(req) {
  let data = [];

  let income = req.body.signals;
  let active_gear = current.getActiveGear() || 0;
  let current_moto = current.getMoto(active_gear) || 0;
  let add_moto = 0;

  income.forEach((e) => {
    add_moto += +e.data.cnt;
    let speed_zone = calcSpeedZone(e.data.tacho);
    if (speed_zone != undefined) {
      let new_moto = current_moto + add_moto;
      data.push(
        `(fromUnixTimestamp(${e.ts}), ${active_gear}, ${speed_zone}, ${new_moto}, ${e.data.tacho}, ${e.data.signal1}, ${e.data.signal2}, ${e.data.signal3})`
      );
    }
  });

  if (add_moto > 0) {
    current.updateMoto(active_gear, current_moto + add_moto);
    myEmitter.emit("moto");
  }

  return data;
}

function lastElementProcceed(req) {
  if (req.body.signals.length < 1) return;

  let income = req.body.signals[req.body.signals.length - 1];
  let signals_data = {};
  signals_data["data"] = {};

  let badges_data = {};
  let ts = income.ts;
  let remoteAddress = req.connection.remoteAddress;

  for (element in income.data) {
    if (element in signals_config) {
      let value = income.data[element];

      signals_data.data[element] = value;
      signals_data["ts"] = ts;
      signals_data["remoteAddress"] = remoteAddress;

      if (signals_config[element]?.gost === true)
        badges_data[element] = calcGostZone(value);

      if (element == "tacho") {
        signals_data.data["speed_zone"] = calcSpeedZone(value);
      }
    }
  }

  current.updateData("badges", badges_data);
  current.updateData("signals", signals_data);
}

function calcGostZone(value) {
  if (value > gost.c) return "D";
  if (value > gost.b) return "C";
  if (value > gost.a) return "B";
  return "A";
}

function bindEvent(event, handler) {
  myEmitter.on(event, handler);
}

function calcSpeedZone(tacho) {
  let speed_zones = signals_config.tacho.speed_zones;
  for (zone_id in speed_zones) {
    if (
      tacho > speed_zones[zone_id].begin &&
      tacho <= speed_zones[zone_id].end
    ) {
      return zone_id;
    }
  }
  console.log("RANGE ERROR = " + tacho);
  return undefined;
  // return 0;
}

let connection;
async function setConnection(con) {
  configs = await config.openMainConfig(con);
  configs.config = await config.openConfigFile("config");
  connection = con;
}

let current;
function setCurrent(cur) {
  current = cur;
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
let transporter;
function setConfig(c) {
  conf = c;
  transporter = nodemailer.createTransport({
    host: conf.get("smtp_server"),
    port: 465,
    secure: true,
    auth: {
      user: conf.get("smtp_user"),
      pass: conf.get("smtp_pass"),
    },
  });
}

module.exports.router = router;
module.exports.setConfig = setConfig;
module.exports.setConnection = setConnection;
module.exports.setCurrent = setCurrent;
module.exports.on = bindEvent;
