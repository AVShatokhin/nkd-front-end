const EventEmitter = require("events");
class MyEmitter extends EventEmitter {}
const myEmitter = new MyEmitter();

var ws = require("ws");
var wsClients = {};

let conf;
function init(c) {
  conf = c;
  var wsocket = new ws.Server({
    port: conf.get("ws_port"),
  });

  wsocket.on("connection", (ws) => {
    var id = Math.random();
    wsClients[id] = ws;

    ws.on("message", (message) => {
      // console.log(`${id}: ${message}`);
      if (message == "get_all") {
        myEmitter.emit("get_all", id);
      }
    });

    ws.on("close", () => {
      // console.log(`closed: ${id}`);
      delete wsClients[id];
    });
  });
}

function bindEvent(event, handler) {
  myEmitter.on(event, handler);
}

function send(data, id) {
  if (id != undefined) {
    // Сообщение предназначено для какого-то конкретного клиента
    if (id in wsClients) {
      wsClients[id].send(data);
    }
    return;
  }

  // Сообщение предназначено для всех
  for (id in wsClients) {
    wsClients[id].send(data);
  }
}

module.exports.init = init;
module.exports.send = send;
module.exports.on = bindEvent;
