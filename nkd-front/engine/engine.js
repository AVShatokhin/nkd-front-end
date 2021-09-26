const mainApi = require("./parts/mainAPI");
const ws = require("./parts/ws");
const current = require("./parts/current");
var config = require("../libs/config.js");

let object = config.openObjectXML();
let yellow_table = config.openConfigFile("yellow_table");
let mnemo_config = config.openConfigFile("mnemo_config");
let signals = config.openSignalsConfig();
let records = config.openConfigFile("records");
let hardware = config.openConfigFile("hardware");

mainApi.setCurrent(current);

function getCurrent() {
  return current;
}

mainApi.on("signals", () => {
  ws.send(JSON.stringify({ signals: current.getDataByLink("signals") }));
  ws.send(JSON.stringify({ badges: current.getDataByLink("badges") }));
  ws.send(JSON.stringify({ moto: current.getDataByLink("moto") }));
});

mainApi.on("diagn", () => {
  ws.send(JSON.stringify({ diagn: current.getDataByLink("diagn") }));
  current.setCMD({ cmd: "diagn", state: false, params: "" });
});

ws.on("get_all", (id) => {
  // ws.send(
  //   JSON.stringify({
  //     configs: {
  //       savedNode: object.savedNode,
  //       yellow_table,
  //       signals,
  //       mnemo_config,
  //       records,
  //       hardware,
  //     },
  //   }),
  //   id
  // );
  ws.send(JSON.stringify(current.getAllData()), id); // current посылаем после того как послали конфиг - модель должна успеть проинициализироваться
});

function updateActiveGear(data) {
  current.updateData("active_gear_collection", { active_gear: data }, true); // true - это dontsave
  ws.send(
    JSON.stringify({
      active_gear_collection: current.getDataByLink("active_gear_collection"),
    })
  );
}

function optionsChanged() {
  current.optionsChanged();
}

function cmd(cmd, params) {
  current.setCMD({ cmd, state: true, params });
}

function setConnection(con) {
  current.setConnection(con);
  mainApi.setConnection(con);
}

function setConfig(c) {
  mainApi.setConfig(c);
  ws.init(c);
}

module.exports = mainApi.router;
module.exports.setConfig = setConfig;
module.exports.setConnection = setConnection;
module.exports.updateActiveGear = updateActiveGear;
module.exports.optionsChanged = optionsChanged;
module.exports.cmd = cmd;
module.exports.getCurrent = getCurrent;
