var express = require("express");
var router = express.Router();
var api = require("../libs/nkd");

const EventEmitter = require("events");
class MyEmitter extends EventEmitter {}
const myEmitter = new MyEmitter();

router.get("/", function (req, res, next) {
  let ans = {
    status: {
      success: false,
      auth: api.check_role(req, "user"),
    },
    data: {},
  };

  if (ans.status.auth != true) {
    res.end(JSON.stringify(ans));
    return;
  }

  res.render("control/control", {}, (err, html) => {
    ans.status.success = true;
    ans.data["html"] = html;
  });

  res.end(JSON.stringify(ans));
});

router.post("/cmd", function (req, res, next) {
  let ans = {
    status: {
      success: false,
    },
    data: {},
  };

  if (!api.check_role(req, "admin")) {
    res.json(ans);
  } else {
    ans.status.success = true;
    myEmitter.emit("cmd", req.body.cmd, req.body.params);
    res.json(ans);
  }
});

function bindEvent(event, handler) {
  myEmitter.on(event, handler);
}

module.exports = router;
module.exports.on = bindEvent;
