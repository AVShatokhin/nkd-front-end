var express = require("express");
var router = express.Router();
var nkd = require("../libs/nkd.js");
// var config = require("../libs/config.js");

const EventEmitter = require("events");
class MyEmitter extends EventEmitter {}
const myEmitter = new MyEmitter();

router.post("/cmd", function (req, res, next) {
  let ans = {
    status: {
      success: false,
    },
    data: {},
  };

  if (!nkd.check_role(req, "admin")) {
    res.json(ans);
  } else {
    ans.status.success = true;
    myEmitter.emit("cmd", req.body.cmd);
    res.json(ans);
  }
});

function bindEvent(event, handler) {
  myEmitter.on(event, handler);
}

module.exports = router;
// module.exports.setConnection = setConnection;
module.exports.on = bindEvent;
