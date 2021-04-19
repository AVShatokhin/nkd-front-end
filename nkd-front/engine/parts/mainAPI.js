var config = require("../../libs/config.js");
var express = require("express");
var router = express.Router();

const EventEmitter = require("events");
class MyEmitter extends EventEmitter {}
const myEmitter = new MyEmitter();

const signals_config = config.openSignalsConfig();

router.get("/generate", async function (req, res, next) {
  // let ts = 1618659044;

  // let a = [];

  // for (let i = 0; i < 365 * 60 * 24; i = i + 5) {
  //   a.push(
  //     `(FROM_UNIXTIME(${ts + 60 * i}), 0, 1, ${i}, ${i * 0.5}, ${i * 0.2}, ${
  //       i * 0.1
  //     })`
  //   );
  // a.push(`(${ts + 60 * (i + 1)}, 0, 2, ${i * 0.5}, ${i * 0.2}, ${i * 0.1})`);
  // a.push(`(${ts + 60 * (i + 2)}, 0, 3, ${i * 0.5}, ${i * 0.2}, ${i * 0.1})`);
  // a.push(`(${ts + 60 * (i + 3)}, 0, 4, ${i * 0.5}, ${i * 0.2}, ${i * 0.1})`);
  // a.push(`(${ts + 60 * (i + 4)}, 0, 5, ${i * 0.5}, ${i * 0.2}, ${i * 0.1})`);
  // }

  // ts = ts + 365 * 60 * 24;

  // for (let i = 0; i < 365 * 60 * 24; i = i + 5) {
  //   a.push(`(${ts + 60 * i}, 1, 1, ${i * 0.5}, ${i * 0.2}, ${i * 0.1})`);
  //   a.push(`(${ts + 60 * (i + 1)}, 1, 2, ${i * 0.5}, ${i * 0.2}, ${i * 0.1})`);
  //   a.push(`(${ts + 60 * (i + 2)}, 1, 3, ${i * 0.5}, ${i * 0.2}, ${i * 0.1})`);
  //   a.push(`(${ts + 60 * (i + 3)}, 1, 4, ${i * 0.5}, ${i * 0.2}, ${i * 0.1})`);
  //   a.push(`(${ts + 60 * (i + 4)}, 1, 5, ${i * 0.5}, ${i * 0.2}, ${i * 0.1})`);
  // }

  // connection.query(
  //   `insert into signals_history (ts, active_gear, speed, tacho, signal1, signal2, signal3) values ${a.join(
  //     ","
  //   )};`,
  //   [],
  //   (err, res) => {
  //     console.log(err);
  //     console.log(res);
  //   }
  // );
  res.json({ ok: "ok" });
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
