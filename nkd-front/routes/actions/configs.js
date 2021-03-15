var express = require("express");
var router = express.Router();
const mysql = require("mysql");
var conf = require("nconf").argv().env().file({ file: "./config/config.json" });
var fs = require("fs");
let users = JSON.parse(fs.readFileSync("./config/users.json"));
var api = require("../../libs/nkd.js");

function check_auth(req, res) {
  if (req.session.auth != true) {
    res.redirect("/auth");
  }
  return req.session.auth || false;
}

// router.post("/set_timers_options/:role", async function (req, res, next) {
//   let ans = { success: false };

//   if (req.session.auth != true) {
//     console.log("Not authed while changing timers config");
//     res.json(ans);
//   } else {
//     let result = await api.setConfig_Timers(connection, req);

//     if (result == "ok") {
//       ans.success = true;
//     }

//     res.json(ans);
//   }
// });

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
