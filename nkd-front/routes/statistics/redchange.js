var express = require("express");
var router = express.Router();
var api = require("../../libs/nkd.js");
var options = require("../../libs/config.js");

let signals = options.openConfigFile("signals");

router.get("/", async function (req, res, next) {
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

  let gearStat = await api.getGearHistory(connection, signals);
  let opt = await options.getOptionsByLink(connection, [
    "active_gear_collection",
  ]);

  res.render(
    "statistics/redchange",
    {
      stat: gearStat,
      active_gear_collection: opt.active_gear_collection,
    },
    (err, html) => {
      ans.status.success = true;
      ans.data["html"] = html;
    }
  );

  res.end(JSON.stringify(ans));
});

let connection;

function setConnection(con) {
  connection = con;
}

module.exports = router;
module.exports.setConnection = setConnection;
