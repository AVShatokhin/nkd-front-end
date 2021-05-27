const mainApi = require("./parts/mainAPI");
const ws = require("./parts/ws");
const current = require("./parts/current");

mainApi.setCurrent(current);

mainApi.on("signals", (data) => {
  current.updateData("signals", data);
  ws.send(JSON.stringify({ signals: data }));
});

mainApi.on("moto", () => {
  let moto = current.getDataByLink("moto");
  if (moto === undefined) return;

  ws.send(JSON.stringify({ moto }));
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
