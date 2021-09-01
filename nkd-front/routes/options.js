var express = require("express");
var router = express.Router();
var nkd = require("../libs/nkd.js");
var config = require("../libs/config.js");

const EventEmitter = require("events");
class MyEmitter extends EventEmitter {}
const myEmitter = new MyEmitter();

router.get("/get_options", async function (req, res, next) {
  if (!nkd.check_role(req, "admin")) {
    res.render("security/noauthreq");
    return;
  }

  let options = await config.getOptionsByLink(connection, [
    "active_gear_collection",
    "update_period_collection",
    "periodiks_collection",
  ]);

  let ans = {
    status: {
      success: false,
    },
    data: {},
  };

  res.render("options/options", options, (err, html) => {
    ans.data["html"] = html;
    ans.data["options"] = options;
  });

  // console.log(ans);

  res.end(JSON.stringify(ans));
});

router.post("/set_options", async function (req, res, next) {
  // console.log(req.body);
  let ans = { success: false };
  if (!nkd.check_role(req, "admin")) {
    console.log("Нет авторизации при изменении настроек");
  } else {
    switch (req.body.link) {
      case "active_gear_collection":
        if (
          await nkd.addGearEvent(
            connection,
            0, // !!!!!!!!!!!!!!!! добавить
            req.body.active_gear,
            nkd.signature(req)
          )
        ) {
          myEmitter.emit("active_gear", req.body.active_gear);
          ans.success = await config.setOptionsByLink(connection, req);
        }
        break;

      case "periodiks_collection":
        // предстоит выяснить причину появления []
        // видимо после передачи объекта с фронта через jquery выполняется преобразование такое,
        // что у массивов появляются квадратные скобки
        req.body["periodiks"] = req.body["periodiks[]"];
        delete req.body["periodiks[]"];
        ans.success = await config.setOptionsByLink(connection, req);
        break;

      default:
        ans.success = await config.setOptionsByLink(connection, req);
    }
  }
  res.json(ans);
});

let connection;

function setConnection(con) {
  connection = con;
}

function bindEvent(event, handler) {
  myEmitter.on(event, handler);
}

module.exports = router;
module.exports.setConnection = setConnection;
module.exports.on = bindEvent;
