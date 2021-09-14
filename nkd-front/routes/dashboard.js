var express = require("express");
var router = express.Router();
var api = require("../libs/nkd.js");
var options = require("../libs/config.js");
const object_parser = require("../libs/classes/object_parser");
var conf = require("nconf")
  .argv()
  .env()
  .file({ file: process.env.NKD_PATH + "./config/config.json" });

let hardware = options.openConfigFile("hardware");
let signals = options.openConfigFile("signals");
let yellow_table = options.openConfigFile("yellow_table");

let savedNode = options.openObjectXML();

router.get("/", function (req, res, next) {
  if (!api.check_role(req, "")) {
    res.redirect("/auth");
    return;
  }

  res.render("dashboard/dashboard", {
    email: req.session.email,
    avatar: req.session.ava,
    ws_url: conf.get("ws_url"),
    build: conf.get("build"),
  });
});

router.get("/get_left_menu", function (req, res, next) {
  if (!api.check_role(req, "user")) {
    res.render("security/noauthreq");
    return;
  }

  res.render("dashboard/menu__left", { role: req.session.role });
});

router.get("/get_main", function (req, res, next) {
  if (!api.check_role(req, "user")) {
    res.render("security/noauthreq");
    return;
  }

  res.render("dashboard/main", { hardware });
});

router.get("/get_control", function (req, res, next) {
  if (!api.check_role(req, "admin")) {
    res.render("security/noauthreq");
    return;
  }
  res.render("dashboard/control");
});

router.get("/get_statistics", function (req, res, next) {
  if (!api.check_role(req, "user")) {
    res.render("security/noauthreq");
    return;
  }

  let __object_parser = new object_parser({
    configs: { savedNode: savedNode.savedNode },
  });

  res.render("dashboard/statistics", {
    objectSortedList: __object_parser.objectSortedList,
    yellow_table,
  });
});

router.get("/get_monitoring", async function (req, res, next) {
  if (!api.check_role(req, "user")) {
    res.render("security/noauthreq");
    return;
  }

  res.render("dashboard/monitoring");
});

router.get("/get_redchange", async function (req, res, next) {
  if (!api.check_role(req, "admin")) {
    res.render("security/noauthreq");
    return;
  }

  let gearStat = await api.getGearHistory(connection, signals);
  let opt = await options.getOptionsByLink(connection, [
    "active_gear_collection",
  ]);

  res.render("dashboard/redchange", {
    stat: gearStat,
    active_gear_collection: opt.active_gear_collection,
  });
});

router.get("/get_mnemo", function (req, res, next) {
  if (!api.check_role(req, "user")) {
    res.render("security/noauthreq");
    return;
  }

  res.render("mnemo/mnemo");
});

router.get("/test", function (req, res, next) {
  res.render("test");
});

let connection;

function setConnection(con) {
  connection = con;
}

module.exports = router;
module.exports.setConnection = setConnection;
