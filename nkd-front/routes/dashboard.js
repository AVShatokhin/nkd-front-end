var express = require("express");
var router = express.Router();
const mysql = require("mysql");
var conf = require("nconf").argv().env().file({ file: "./config/config.json" });
var fs = require("fs");
let users = JSON.parse(fs.readFileSync("./config/users.json"));
var api = require("../libs/nkd.js");

function check_auth(req, res) {
  if (req.session.auth != true) {
    res.redirect("/auth");
  }
  return req.session.auth || false;
}

router.get("/", function (req, res, next) {
  if (!check_auth(req, res)) return;
  res.render("dashboard/dashboard", {
    email: req.session.email,
    avatar: req.session.ava,
  });
});

router.get("/get_left_menu", function (req, res, next) {
  if (!check_auth(req, res)) return;

  res.render("dashboard/menu__left");
});

router.get("/get_main", function (req, res, next) {
  if (!check_auth(req, res)) return;

  res.render("dashboard/main");
});

router.get("/get_mnemo", function (req, res, next) {
  if (!check_auth(req, res)) return;

  res.render("mnemo/mnemo");
});

router.get("/test", function (req, res, next) {
  res.render("test");
});

const connection = mysql.createConnection({
  host: conf.get("db_host"),
  user: conf.get("db_user"),
  database: conf.get("db_name"),
  password: conf.get("db_password"),
});

connection.connect((err) => {
  if (err) {
    console.log(err);
    throw err;
  }
  console.log("mysql connected");
});

module.exports = router;
