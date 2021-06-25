var config = require("../../libs/config.js");
var express = require("express");
var router = express.Router();
const EventEmitter = require("events");
class MyEmitter extends EventEmitter {}
const myEmitter = new MyEmitter();
const { ClickHouse } = require("clickhouse");

const signals_config = config.openConfigFile("signals");
const gost = config.openConfigFile("gost_iso_10816_1_97");

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
    lastElementProcceed(req);
    myEmitter.emit("signals");
  }

  if ("diagn" in req.body) {
    ans.status.success = true;
    // insert(dataSeriesProcceed(req));
    // lastElementProcceed(req);
    current.updateData("diagn", req.body.diagn);
    myEmitter.emit("diagn");
  }

  res.json(ans);
});

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

      if ("gost" in signals_config[element])
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
function setConfig(c) {
  conf = c;
}

module.exports.router = router;
module.exports.setConfig = setConfig;
module.exports.setConnection = setConnection;
module.exports.setCurrent = setCurrent;
module.exports.on = bindEvent;
