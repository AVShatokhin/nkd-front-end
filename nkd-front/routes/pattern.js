var express = require("express");
var router = express.Router();
var api = require("../libs/nkd.js");
// var options = require("../libs/config.js");

var conf = require("nconf")
  .argv()
  .env()
  .file({ file: process.env.NKD_PATH + "./config/config.json" });

// let hardware = options.openConfigFile("hardware");

router.get("/", function (req, res, next) {
  if (!api.check_role(req, "")) {
    res.redirect("/auth");
    return;
  }

  res.render("pattern", {
    email: req.session.email,
    avatar: req.session.ava,
    build: conf.get("build"),
    app_title: conf.get("app_title"),
    app_vendor: conf.get("app_vendor"),
  });
});

router.get("/get_left_menu", function (req, res, next) {
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

  res.render(
    "pattern/dashboard/menu__left",
    { role: req.session.role },
    (err, html) => {
      ans.status.success = true;
      ans.data["html"] = html;
    }
  );

  res.end(JSON.stringify(ans));
});

// router.get("/get_control", function (req, res, next) {
//   let ans = {
//     status: {
//       success: false,
//       auth: api.check_role(req, "user"),
//     },
//     data: {},
//   };

//   if (ans.status.auth != true) {
//     res.end(JSON.stringify(ans));
//     return;
//   }

//   res.render("dashboard/control", {}, (err, html) => {
//     ans.status.success = true;
//     ans.data["html"] = html;
//   });

//   res.end(JSON.stringify(ans));
// });

// router.get("/get_statistics", function (req, res, next) {
//   let ans = {
//     status: {
//       success: false,
//       auth: api.check_role(req, "user"),
//     },
//     data: {},
//   };

//   if (ans.status.auth != true) {
//     res.end(JSON.stringify(ans));
//     return;
//   }

//   let __object_parser = new object_parser({
//     configs: { savedNode: savedNode.savedNode },
//   });

//   res.render(
//     "dashboard/statistics",
//     {
//       objectSortedList: __object_parser.objectSortedList,
//       yellow_table,
//     },
//     (err, html) => {
//       ans.status.success = true;
//       ans.data["html"] = html;
//     }
//   );

//   res.end(JSON.stringify(ans));
// });

// router.get("/get_monitoring", async function (req, res, next) {
//   let ans = {
//     status: {
//       success: false,
//       auth: api.check_role(req, "user"),
//     },
//     data: {},
//   };

//   if (ans.status.auth != true) {
//     res.end(JSON.stringify(ans));
//     return;
//   }

//   res.render("dashboard/monitoring", {}, (err, html) => {
//     ans.status.success = true;
//     ans.data["html"] = html;
//   });

//   res.end(JSON.stringify(ans));
// });

// router.get("/get_redchange", async function (req, res, next) {
//   let ans = {
//     status: {
//       success: false,
//       auth: api.check_role(req, "user"),
//     },
//     data: {},
//   };

//   if (ans.status.auth != true) {
//     res.end(JSON.stringify(ans));
//     return;
//   }

//   let gearStat = await api.getGearHistory(connection, signals);
//   let opt = await options.getOptionsByLink(connection, [
//     "active_gear_collection",
//   ]);

//   res.render(
//     "dashboard/redchange",
//     {
//       stat: gearStat,
//       active_gear_collection: opt.active_gear_collection,
//     },
//     (err, html) => {
//       ans.status.success = true;
//       ans.data["html"] = html;
//     }
//   );

//   res.end(JSON.stringify(ans));
// });

// let connection;

// function setConnection(con) {
//   connection = con;
// }

module.exports = router;
// module.exports.setConnection = setConnection;
