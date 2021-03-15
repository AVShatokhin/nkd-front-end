var express = require("express");
var router = express.Router();

router.get("/session_info", function (req, res, next) {
  res.send(req.session);
});

module.exports = router;
