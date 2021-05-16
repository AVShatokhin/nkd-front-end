var socket;
var timer;

let url;

function bindHandlers() {
  socket.onopen = function () {
    // console.log("Соединение установлено.");
    getAllClient();
    setServerState(true);
  };

  socket.onclose = function (event) {
    if (event.wasClean) {
      // console.log("Соединение закрыто чисто");
    } else {
      // console.log("Обрыв соединения");
    }
    // console.log("Код: " + event.code + " причина: " + event.reason);
    setServerState(false);
  };

  socket.onmessage = function (event) {
    console.log("Получены данные " + event.data);
    data = JSON.parse(event.data);
    if (data != undefined) {
      for (element in data) {
        //console.log(element);
        switch (element) {
          case "moto":
            processMoto(data);
            break;
          case "signals":
            processSignals(data);
            break;
          case "badges":
            processBadges(data);
            break;
          case "active_gear_collection":
            processActiveGear(data);
            break;
          case "loading":
            // сервер сказал что не готов обрабатывать WS
            setTimeout(() => {
              getAllClient();
            }, 1000);
            break;
          default:
            break;
        }
      }
    }
  };

  socket.onerror = function (error) {
    // console.log("Ошибка " + error.message);
  };
}

function getAllClient() {
  resetTarget("signals");
  resetTarget("moto");
  resetActiveGear();
  resetBadges();
  socket.send("get_all");
}

function initClient(ws_url) {
  if (ws_url != undefined) url = ws_url;

  if (socket == undefined) {
    socket = new WebSocket(url);
    // console.log("Создание нового сокета");
  } else {
    if (socket.readyState == 3) {
      socket = new WebSocket(url);
      //console.log("Создание нового сокета после дисконнекта");
    }
  }
  bindHandlers();
}

function setServerState(state) {
  if (state == true) {
    $("#span__serverState").html("Сервер на связи");
    $("#span__serverState").removeClass("bg-danger");
    $("#span__serverState").addClass("bg-success");
  } else {
    $("#span__serverState").html("Нет связи");
    $("#span__serverState").removeClass("bg-success");
    $("#span__serverState").addClass("bg-danger");

    setTimeout(() => {
      //console.log("Переподключение...");
      initClient();
    }, 1000);
  }
}

function processSignals(data) {
  resetTarget("signals");
  for (signal in data.signals) {
    $(`span#${signal}[source=signals]`).html(data.signals[signal]);
  }
}

function resetTarget(target) {
  $(`span[source=${target}]`).html("-");
}

function processMoto(data) {
  resetTarget("moto");
  for (motoNum in data.moto) {
    $(`span#${motoNum}[source=moto]`).html(data.moto[motoNum]);
  }
}

function processActiveGear(data) {
  if ("active_gear_collection" in data) {
    if (data.active_gear_collection.active_gear == 0) {
      $("span#active_gear_0").removeClass("d-none");
      $("span#active_gear_0").addClass("d-inline");
      $("span#active_gear_1").removeClass("d-inline");
      $("span#active_gear_1").addClass("d-none");
    } else {
      $("span#active_gear_1").removeClass("d-none");
      $("span#active_gear_1").addClass("d-inline");
      $("span#active_gear_0").removeClass("d-inline");
      $("span#active_gear_0").addClass("d-none");
    }
  } else {
    resetActiveGear();
  }
}

function resetActiveGear() {
  $("span#active_gear_0").removeClass("d-inline");
  $("span#active_gear_0").addClass("d-none");
  $("span#active_gear_1").removeClass("d-inline");
  $("span#active_gear_1").addClass("d-none");
}

function processBadges(data) {
  for (badge in data.badges) {
    $(`span#${badge}[source=badges]`).removeClass("bg-primary");
    $(`span#${badge}[source=badges]`).removeClass("bg-warning");
    $(`span#${badge}[source=badges]`).removeClass("bg-danger");
    if (data.badges[badge] == "normal") {
      $(`span#${badge}[source=badges]`).addClass("bg-primary");
      $(`span#${badge}[source=badges]`).html("Зона А");
    } else if (data.badges[badge] == "warning") {
      $(`span#${badge}[source=badges]`).addClass("bg-warning");
      $(`span#${badge}[source=badges]`).html("Зона B");
    } else if (data.badges[badge] == "danger") {
      $(`span#${badge}[source=badges]`).addClass("bg-danger");
      $(`span#${badge}[source=badges]`).html("Зона C");
    }
  }
}

function resetBadges() {
  $(`span[source=badges]`).removeClass("bg-primary");
  $(`span[source=badges]`).removeClass("bg-warning");
  $(`span[source=badges]`).removeClass("bg-danger");
  $(`span[source=badges]`).html("");
}
