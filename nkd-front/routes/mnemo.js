var express = require("express");
var router = express.Router();
var api = require("../libs/nkd.js");

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

  res.render("mnemo/mnemo", {}, (err, html) => {
    ans.status.success = true;
    ans.data["html"] = html;
  });

  res.end(JSON.stringify(ans));
});

module.exports = router;
