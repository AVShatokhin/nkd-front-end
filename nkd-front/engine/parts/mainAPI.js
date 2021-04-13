var config = require("../../libs/config.js");
var express = require("express");
var router = express.Router();

const EventEmitter = require("events");
class MyEmitter extends EventEmitter {}
const myEmitter = new MyEmitter();

const signals_config = config.openSignalsConfig();

router.get("/get_config", async function (req, res, next) {
  let ans = {
    status: {
      success: true,
    },
    data: await config.openMainConfig(connection),
  };

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
    let signals_data = {};
    let badges_data = {};
    // console.log(signals_config);
    for (element in req.body.signals) {
      if (element in signals_config) {
        value = req.body.signals[element];

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
    ans.status.success = true;
    myEmitter.emit("signals", signals_data);
    myEmitter.emit("badges", badges_data);
  }

  res.json(ans);
});

function bindEvent(event, handler) {
  myEmitter.on(event, handler);
}

let connection;

function setConnection(con) {
  connection = con;
}

module.exports.router = router;
module.exports.setConnection = setConnection;
module.exports.on = bindEvent;
