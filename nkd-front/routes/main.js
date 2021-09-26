var express = require("express");
var router = express.Router();
var api = require("../libs/nkd.js");
var options = require("../libs/config.js");
var conf = require("nconf")
  .argv()
  .env()
  .file({ file: process.env.NKD_PATH + "./config/config.json" });

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

  res.render("main/main", {}, (err, html) => {
    ans.status.success = true;
    ans.data["html"] = html;
  });

  res.end(JSON.stringify(ans));
});

module.exports = router;
