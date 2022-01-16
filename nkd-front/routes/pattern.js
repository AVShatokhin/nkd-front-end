var express = require("express");
var router = express.Router();
var api = require("../libs/nkd.js");
var conf = require("nconf")
  .argv()
  .env()
  .file({ file: process.env.NKD_PATH + "./config/config.json" });

router.get("/", function (req, res, next) {
  if (!api.check_role(req, "")) {
    res.redirect("/auth");
    return;
  }

  res.render("i_pattern", {
    email: req.session.email,
    avatar: req.session.ava,
    build: conf.get("build"),
    app_title: conf.get("app_title"),
    app_vendor: conf.get("app_vendor"),
    app_name: conf.get("app_name"),
    app_update: conf.get("app_update"),
  });
});

module.exports = router;
