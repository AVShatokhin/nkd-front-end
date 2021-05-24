// `use strict`;

var config = require("../../libs/config.js");
var express = require("express");
var router = express.Router();
const EventEmitter = require("events");
class MyEmitter extends EventEmitter {}
const myEmitter = new MyEmitter();

const signals_config = config.openSignalsConfig();

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

router.post("/income/", function (req, res, next) {
  let ans = {
    status: {
      success: false,
    },
    data: [],
  };

  if ("signals" in req.body) {
    ans.status.success = true;
    insert(dataSeriesProcceed(req));
    if (req.body.signals.length > 0) lastElementProcceed(req);
  }

  res.json(ans);
});

async function insert(data) {
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
  let cur = current.getAllData();

  let moto = {
    moto_0: 0,
    moto_1: 0,
    moto_factor: signals_config.cnt.moto_factor,
  };

  if ("moto" in cur) {
    moto.moto_0 = cur.moto.moto_0;
    moto.moto_1 = cur.moto.moto_1;
  }

  let active_gear = 0;

  if ("active_gear_collection" in cur) {
    if ("active_gear" in cur.active_gear_collection) {
      active_gear = cur.active_gear_collection.active_gear;
    }
  }

  income.forEach((e) => {
    moto[`moto_${active_gear}`] = +moto[`moto_${active_gear}`] + +e.data.cnt;

    // let ts = e.ts || 0;
    // let tacho = e.data.tacho || 0;
    // let speed = calcSpeedZone(tacho);
    // let moto?? = moto[`moto_${active_gear}`];
    // let signal1,
    // let signal2,
    // let signal3

    data.push(
      `(fromUnixTimestamp(${e.ts}), ${active_gear}, ${calcSpeedZone(
        e.data.tacho
      )}, ${moto[`moto_${active_gear}`]}, ${e.data.tacho}, ${e.data.signal1}, ${
        e.data.signal2
      }, ${e.data.signal3})`
    );
  });

  myEmitter.emit("moto", moto);

  return data;
}

function lastElementProcceed(req) {
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

      badges_data[element] = "normal";
      if (value - signals_config[element].limit_normal > 0) {
        badges_data[element] = "warning";
      }
      if (value - signals_config[element].limit_warning > 0) {
        badges_data[element] = "danger";
      }

      if (element == "tacho") {
        signals_data.data["speed_zone"] = calcSpeedZone(value);
      }
    }
  }

  myEmitter.emit("signals", signals_data);
  myEmitter.emit("badges", badges_data);
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
  // return undefined;
  return 0;
}

let connection;
function setConnection(con) {
  connection = con;
}

let current;
function setCurrent(cur) {
  current = cur;
}

let clickhouse;
function setCHConnection(con) {
  clickhouse = con;
}

module.exports.router = router;
module.exports.setCHConnection = setCHConnection;
module.exports.setConnection = setConnection;
module.exports.setCurrent = setCurrent;
module.exports.on = bindEvent;
