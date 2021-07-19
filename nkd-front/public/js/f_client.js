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
            sessionStorage.setItem("configs", JSON.stringify(data.configs));
            treetable__currentResult_model = new dresult_model({
              configs: data.configs,
              treetable: new treetable("treetable__currentResult"),
              mnemo: new mnemo(data.configs.mnemo_config, "div__mnemo"),
            });
            break;
          case "diagn":
            treetable__currentResult_model.update(data.diagn);
            processMetaInfoDiagn(data.diagn);
            break;
          case "moto":
            processMoto(data);
            treetable__currentResult_model._mnemo.plotMoto(data.moto);
            break;
          case "signals":
            processSignals(data);
            treetable__currentResult_model._mnemo.plotSignals(data.signals);
            break;
          case "badges":
            processBadges(data);
            treetable__currentResult_model._mnemo.plotBadges(data.badges);
            break;
          case "active_gear_collection":
            processActiveGear(data);
            treetable__currentResult_model._mnemo.plotActiveGear(
              data.active_gear_collection
            );
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

function processMetaInfoDiagn(diagn) {
  let __freq = diagn.freq;
  let __speed_zone = diagn.speed_zone;

  let __active_gear = ["Редуктор №1", "Редуктор №2"][diagn.active_gear];

  let __configs = JSON.parse(sessionStorage.getItem("configs"));

  let __moto = calcMoto(diagn.moto, __configs.signals.cnt.moto_factor);

  let __calc_ts = new Date(diagn.calc_ts * 1000).toLocaleString("ru", {
    timezone: "UTC",
    hour: "numeric",
    minute: "numeric",
    second: "numeric",
    year: "numeric",
    month: "numeric",
    day: "numeric",
  });

  let __record_ts = new Date(diagn.record_ts * 1000).toLocaleString("ru", {
    timezone: "UTC",
    hour: "numeric",
    minute: "numeric",
    second: "numeric",
    year: "numeric",
    month: "numeric",
    day: "numeric",
  });

  $("div#div__speedfreq").html(
    `<div class="p-1">Скорость дороги, м/с : <span class="badge bg-primary  p-2">${__speed_zone}</span></div>` +
      `<div class="p-1">Частота вращения, Гц : <span class="badge bg-primary  p-2">${__freq}</span></div>`
  );
  $("div#div__dates").html(
    `<div class="p-1">Дата замера : <span class="badge bg-primary  p-2">${__record_ts}</span></div>` +
      `<div class="p-1">Дата вычисления : <span class="badge bg-primary  p-2">${__calc_ts}</span></div>`
  );
  $("div#div__gearmoto").html(
    `<div class="p-1">Редуктор : <span class="badge bg-primary  p-2">${__active_gear}</span></div>` +
      `<div class="p-1">Наработка, час:мин : <span class="badge bg-primary  p-2">${__moto}</span></div>`
  );
}

function resetMetaInfoDiagn() {
  $("div#div__speedfreq").html(
    "<div>Скорость дороги : -</div><div>Частота вращения : -</div>"
  );
  $("div#div__dates").html(
    "<div>Дата замера : -</div><div>Дата вычисления : -</div>"
  );
  $("div#div__gearmoto").html(
    "<div>Редуктор : -</div><div>Наработка : -</div>"
  );
}

function getAllClient() {
  resetTarget("signals");
  resetTarget("moto");
  resetActiveGear();
  resetBadges();
  resetMetaInfoDiagn();
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

  $(`span#moto_0[source=moto]`).html(
    calcMoto(data.moto.moto_0, data.moto.moto_factor)
  );
  $(`span#moto_1[source=moto]`).html(
    calcMoto(data.moto.moto_1, data.moto.moto_factor)
  );
}

function calcMoto(moto, factor) {
  let m_sec = moto * factor;
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
