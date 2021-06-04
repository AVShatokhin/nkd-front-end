const mainApi = require("./parts/mainAPI");
const ws = require("./parts/ws");
const current = require("./parts/current");

mainApi.setCurrent(current);

mainApi.on("signals", () => {
  ws.send(JSON.stringify({ signals: current.getDataByLink("signals") }));
  ws.send(JSON.stringify({ badges: current.getDataByLink("badges") }));
  ws.send(JSON.stringify({ moto: current.getDataByLink("moto") }));
});

ws.on("get_all", (id) => {
  ws.send(JSON.stringify(current.getAllData()), id);
});

function updateActiveGear(data) {
  current.updateData("active_gear_collection", { active_gear: data }, true); // true - это dontsave
  ws.send(
    JSON.stringify({
      active_gear_collection: current.getDataByLink("active_gear_collection"),
    })
  );
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
