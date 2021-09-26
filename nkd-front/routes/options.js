var express = require("express");
var router = express.Router();
var nkd = require("../libs/nkd.js");
var config = require("../libs/config.js");
let current;

const EventEmitter = require("events");
class MyEmitter extends EventEmitter {}
const myEmitter = new MyEmitter();

router.get("/get_options", async function (req, res, next) {
  let options = await config.getOptionsByLink(connection, [
    "active_gear_collection",
    "update_period_collection",
    "periodiks_collection",
  ]);

  let ans = {
    status: {
      success: false,
      auth: nkd.check_role(req, "admin"),
    },
    data: {},
  };

  if (ans.status.auth != true) {
    res.end(JSON.stringify(ans));
    return;
  }

  res.render("options/options", options, (err, html) => {
    ans.data["html"] = html;
    ans.data["options"] = options;
  });

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
        let __active_gear = current.getActiveGear();
        let __moto = current.getMoto(__active_gear);

        // console.log(__moto);

        if (
          await nkd.addGearEvent(
            connection,
            __moto,
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
        // добавлено позже. на самом деле удобно с помощью скобок определять массив там или нет

        if (req.body["periodiks[]"] != undefined) {
          req.body["periodiks"] = req.body["periodiks[]"];
          delete req.body["periodiks[]"];
        } else {
          let __temp = req.body["periodiks"];
          req.body["periodiks"] = [__temp];
        }

        ans.success = await config.setOptionsByLink(connection, req);
        myEmitter.emit("optionsChanged");
        break;

      default:
        ans.success = await config.setOptionsByLink(connection, req);
        myEmitter.emit("optionsChanged");
    }
  }
  res.json(ans);
});

function setCurrent(__current) {
  current = __current;
}

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
module.exports.setCurrent = setCurrent;
