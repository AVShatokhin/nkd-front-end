var config = require("../../libs/config.js");
var nkd = require("../../libs/nkd.js");

const dresult_render = require("../../libs/classes/dresult_render.js");

var express = require("express");
var router = express.Router();
const EventEmitter = require("events");
class MyEmitter extends EventEmitter {}
const myEmitter = new MyEmitter();
const { ClickHouse } = require("clickhouse");
const nodemailer = require("nodemailer");

const signals_config = config.openConfigFile("signals");
const gost = config.openConfigFile("gost_iso_10816_1_97");
let object = config.openObjectXML();

let configs = {
  savedNode: object.savedNode,
  yellow_table: config.openConfigFile("yellow_table"),
  mnemo_config: config.openConfigFile("mnemo_config"),
  signals: config.openSignalsConfig(),
  records: config.openConfigFile("records"),
  hardware: config.openConfigFile("hardware"),
};

router.get("/text", function (req, res, next) {
  res.json({ diagns: samples, configs });
});

router.get("/get_rolling_csv", async function (req, res, next) {
  let csv = "";

  let items = config.openRollingFromXML().root.parts.item;

  items.forEach((i) => {
    csv =
      csv +
      `${i.vendor};${i.name};${i.internalD};${i.outerD};${i.angle};${i.rollcount};${i.rollerD};\n`;
  });

  csv = csv.replace(/\,/g, ".");

  res.end(csv);
});

router.get("/get_rolling_json", function (req, res, next) {
  let ans = {
    status: {
      success: true,
    },
    data: config.openRollingFromXML(),
  };

  res.json(ans);
});

router.get("/get_config", async function (req, res, next) {
  let ans = {
    status: {
      success: true,
    },
    data: await config.openMainConfig(connection),
  };

  res.json(ans);
});

router.get("/get_current/", function (req, res, next) {
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
    data: [],
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
    await DIANG_statisticWrite(connection, ans, req.body.diagn);
    myEmitter.emit("diagn");
    await DIAGN_sendEmails(connection, req.body.diagn);
  }

  res.json(ans);
});

async function DIAGN_sendEmails(connection, diagn) {
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
        subject: `GTLab.Диагностика: получены результаты диагностической процедуры [${Math.random()}]`,
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

async function DIANG_statisticWrite(connection, ans, diagn) {
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
function setConnection(con) {
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

// хорошенько подчистить всё отладочное !!!

// let start_ts = 1625465938;
// let active_gear = [0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0];
// let freq = [10, 16, 19, 10, 16, 19, 10, 16, 19, 10, 16];
// let index = 0;
// let moto = [0, 0];

// let samples = [
//   config.openConfigFile("test/diagn_1"),
//   config.openConfigFile("test/diagn_2"),
//   config.openConfigFile("test/diagn_3"),
//   config.openConfigFile("test/diagn_4"),
//   config.openConfigFile("test/diagn_5"),
//   config.openConfigFile("test/diagn_6"),
//   config.openConfigFile("test/diagn_7"),
//   config.openConfigFile("test/diagn_8"),
//   config.openConfigFile("test/diagn_9"),
// ];

// let diagn = samples[index].diagn;
// console.log(diagn);

// for (let i = 1; i < 365; i++) {
//   diagn.record_ts = start_ts;
//   diagn.calc_ts = start_ts + 60;

//   diagn.active_gear = active_gear[index];
//   diagn.moto = moto[active_gear[index]];
//   diagn.freq = freq[index];

//   diagn.mode = "auto";

//   await DIANG_statisticWrite(connection, ans, diagn);

//   start_ts = start_ts + 24 * 3600;
//   moto[active_gear[index]] =
//     moto[active_gear[index]] + 24 * 3600 * freq[index];
//   console.log(".");
// }

// index = index + 1;
// if (index > 8) index = 0;
