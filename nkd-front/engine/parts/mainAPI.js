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
    dataSeriesProcceed(req.body.signals);
    if (req.body.signals.length > 0)
      lastElementProcceed(req.body.signals[req.body.signals.length - 1]);
  }

  res.json(ans);
});

function dataSeriesProcceed(income) {
  // let newData = {};
  let cur = current.getAllData();
  let moto = { moto_0: 0, moto_1: 0 };
  let active_gear = 0;

  if ("moto" in cur) {
    moto = cur.moto;
  }

  if ("active_gear_collection" in cur) {
    if ("active_gear" in cur.active_gear_collection) {
      active_gear = cur.active_gear_collection.active_gear;
    }
  }

  let cnt = moto[`moto_${active_gear}`];

  income.forEach((e) => {
    cnt += e.data.cnt;
  });

  moto[`moto_${active_gear}`] = cnt;

  myEmitter.emit("moto", moto);
  // return newData;
}

function lastElementProcceed(income) {
  let signals_data = {};
  let badges_data = {};

  for (element in income.data) {
    if (element in signals_config) {
      value = income.data[element];
      signals_data[element] = value;
      badges_data[element] = "normal";
      if (value - signals_config[element].limit_normal > 0) {
        badges_data[element] = "warning";
      }
      if (value - signals_config[element].limit_warning > 0) {
        badges_data[element] = "danger";
      }
    }
  }

  myEmitter.emit("signals", signals_data);
  myEmitter.emit("badges", badges_data);
}

function bindEvent(event, handler) {
  myEmitter.on(event, handler);
}

let connection;
function setConnection(con) {
  connection = con;
}

let current;
function setCurrent(cur) {
  current = cur;
}

module.exports.router = router;
module.exports.setConnection = setConnection;
module.exports.setCurrent = setCurrent;
module.exports.on = bindEvent;
