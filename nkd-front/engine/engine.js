const mainApi = require("./parts/mainAPI");
const ws = require("./parts/ws.js");
const current = require("./parts/current");

mainApi.on("signals", (data) => {
  current.updateData("signals", data);
  ws.send(JSON.stringify({ signals: data }));
});

mainApi.on("badges", (data) => {
  current.updateData("badges", data);
  ws.send(JSON.stringify({ badges: data }));
});

ws.on("get_all", (id) => {
  ws.send(JSON.stringify(current.getAllData()), id);
});

function updateActiveGear(data) {
  //   console.log(data);
  current.updateData("active_gear_collection", { active_gear: data }, true); // true - это dontsave
  ws.send(JSON.stringify({ active_gear_collection: { active_gear: data } }));
}

// let current = require("./libs/engine/current.js");
// current.setConnection(connection);

// var mainApiRouter = require("./libs/engine/mainAPI");

// (data) => {
//   console.log(data);
//   //   ws.send(current.updateSignals(data));
// });

// var nkd = require("./nkd.js");
// var express = require("express");
// var router = express.Router();

// const EventEmitter = require("events");
// class MyEmitter extends EventEmitter {}
// const myEmitter = new MyEmitter();

// const ansMaket = {
//   status: {
//     success: false,
//   },
//   data: [],
// };

// router.get("/get_config", async function (req, res, next) {
//   let ans = ansMaket;
//   ans.data = nkd.openMainConfig();
//   ans.status.success = true;
//   res.json(ans);
// });

// router.post("/income/", function (req, res, next) {
//   let ans = ansMaket;
//   for (current_collection in req.body) {
//     switch (current_collection) {
//       case "signals":
//         ans.status.success = true;
//         myEmitter.emit("signals", req.body.signals);
//         break;
//       default:
//         break;
//     }
//   }
//   res.json(ans);
// });

// function bindEvent(event, handler) {
//   myEmitter.on(event, handler);
// }
// module.exports.on = bindEvent;

function setConnection(con) {
  current.setConnection(con);
  mainApi.setConnection(con);
}

module.exports = mainApi.router;
module.exports.setConnection = setConnection;
module.exports.updateActiveGear = updateActiveGear;
