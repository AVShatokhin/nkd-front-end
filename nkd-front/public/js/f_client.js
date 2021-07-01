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
    // console.log("Получены данные " + event.data);
    data = JSON.parse(event.data);
    if (data != undefined) {
      for (element in data) {
        //console.log(element);
        switch (element) {
          case "configs":
            treetable__currentResult_model = new dresult_model(
              data.configs,
              new treetable("treetable__currentResult"),
              new mnemo(data.configs.mnemo_config, "div__mnemo")
            );
            break;
          case "diagn":
            treetable__currentResult_model.update(data.diagn);
            break;
          case "result":
            break;
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

function processSignals(income) {
  resetTarget("signals");

  for (signal in income.signals.data) {
    $(`span#${signal}[source=signals]`).html(income.signals.data[signal]);
  }

  $(`span#ts[source=signals]`).html(
    new Date(income.signals.ts * 1000).toLocaleString("ru", {
      timezone: "UTC",
      hour: "numeric",
      minute: "numeric",
      second: "numeric",
      year: "numeric",
      month: "numeric",
      day: "numeric",
    })
  );

  $(`span#remoteAddress[source=signals]`).html(income.signals.remoteAddress);
}

function resetTarget(target) {
  $(`span[source=${target}]`).html("-");
}

function processMoto(data) {
  resetTarget("moto");

  $(`span#moto_0[source=moto]`).html(calcMoto(data.moto.moto_0));
  $(`span#moto_1[source=moto]`).html(calcMoto(data.moto.moto_1));
}

function calcMoto(moto) {
  let m_sec = moto * data.moto.moto_factor;
  let m_min = Math.trunc(m_sec / 60);
  let m_hour = Math.trunc(m_min / 60);

  m_min = m_min - m_hour * 60;

  if (m_min < 10) {
    m_min = "0" + m_min;
  }

  return `${m_hour} : ${m_min}`;
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
    if (data.badges[badge] == "A") {
      $(`span#${badge}[source=badges]`).addClass("bg-primary");
      $(`span#${badge}[source=badges]`).html("Зона А");
    } else if (data.badges[badge] == "B") {
      $(`span#${badge}[source=badges]`).addClass("bg-success");
      $(`span#${badge}[source=badges]`).html("Зона B");
    } else if (data.badges[badge] == "C") {
      $(`span#${badge}[source=badges]`).addClass("bg-warning");
      $(`span#${badge}[source=badges]`).html("Зона C");
    } else if (data.badges[badge] == "D") {
      $(`span#${badge}[source=badges]`).addClass("bg-danger");
      $(`span#${badge}[source=badges]`).html("Зона D");
    }
  }
}

function resetBadges() {
  $(`span[source=badges]`).removeClass("bg-primary");
  $(`span[source=badges]`).removeClass("bg-warning");
  $(`span[source=badges]`).removeClass("bg-danger");
  $(`span[source=badges]`).html("");
}
