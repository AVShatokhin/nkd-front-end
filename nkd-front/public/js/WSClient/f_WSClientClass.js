class WSClient {
  // ===================== PUBLIC
  constructor(opts) {
    this._treetable__currentResult_model = opts?.models?.diagn;
    this._monitoring = opts?.models?.monitoring;
    this._url = opts?.url;
    this._socket;
    this._timer;
    this._initClient(this._url);
  }

  _initClient(ws_url) {
    if (ws_url != undefined) this._url = ws_url;

    if (this._socket == undefined) {
      this._socket = new WebSocket(this._url);
      // console.log("Создание нового сокета");
    } else {
      if (this._socket.readyState == 3) {
        this._socket = new WebSocket(this._url);
        //console.log("Создание нового сокета после дисконнекта");
      }
    }
    this._socket.WSClient = this; // очень хитрая хитрость
    this._bindHandlers();
  }

  _getAllClient() {
    this._resetMetaInfoDiagn();
    this._socket.send("get_all");
  }

  _bindHandlers() {
    this._socket.onopen = function () {
      // console.log("Соединение установлено.");
      this.WSClient._getAllClient();
      this.WSClient._setServerState(true);
    };

    this._socket.onclose = function (event) {
      if (event.wasClean) {
        // console.log("Соединение закрыто чисто");
      } else {
        // console.log("Обрыв соединения");
      }
      // console.log("Код: " + event.code + " причина: " + event.reason);
      this.WSClient._setServerState(false);
    };

    this._socket.onmessage = function (event) {
      // console.log("Получены данные " + event.data);
      let data = JSON.parse(event.data);
      if (data != undefined) {
        for (let element in data) {
          // console.log(element);

          switch (element) {
            // case "configs":
            //   // sessionStorage.setItem("configs", JSON.stringify(data.configs));
            //   // treetable__currentResult_model = new dresult_model({
            //   //   configs: data.configs,
            //   //   treetable: new treetable("treetable__currentResult"),
            //   //   mnemo: new mnemo(data.configs.mnemo_config, "div__mnemo"),
            //   // });
            //   break;
            case "diagn":
              this.WSClient._treetable__currentResult_model.update(data.diagn);
              // this.WSClient._processMetaInfoDiagn(data.diagn);
              break;
            case "moto":
              this.WSClient._processMoto(data);
              this.WSClient._treetable__currentResult_model._mnemo.plotMoto(
                data.moto
              );
              break;
            case "signals":
              this.WSClient._processSignals(data);
              this.WSClient._treetable__currentResult_model._mnemo.plotSignals(
                data.signals
              );
              break;
            case "badges":
              this.WSClient._processBadges(data);
              this.WSClient._treetable__currentResult_model._mnemo.plotBadges(
                data.badges
              );
              break;
            case "active_gear_collection":
              this.WSClient._processActiveGear(data);
              this.WSClient._treetable__currentResult_model._mnemo.plotActiveGear(
                data.active_gear_collection
              );
              break;
            case "loading":
              // сервер сказал что не готов обрабатывать WS
              setTimeout(() => {
                this.WSClient._getAllClient();
              }, 1000);
              break;
            default:
              break;
          }
        }
      }
    };

    this._socket.onerror = function (error) {
      // console.log("Ошибка " + error.message);
    };
  }

  _resetMetaInfoDiagn() {
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

  _setServerState(state) {
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
        this._initClient();
      }, 1000);
    }
  }

  _processSignals(income) {
    this._monitoring.signals = income.signals.data;
    this._monitoring.ts = income.signals.ts;
    this._monitoring.remoteAddress = income.signals.remoteAddress;
  }

  _resetTarget(target) {
    $(`span[source=${target}]`).html("-");
  }

  _processMoto(data) {
    this._monitoring.moto_0 = data.moto.moto_0;
    this._monitoring.moto_1 = data.moto.moto_1;
  }

  _processActiveGear(data) {
    this._monitoring.active_gear = data.active_gear_collection.active_gear;
  }

  _processBadges(data) {
    this._monitoring.badges = data.badges;

    for (let badge in data.badges) {
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

  _resetBadges() {
    $(`span[source=badges]`).removeClass("bg-primary");
    $(`span[source=badges]`).removeClass("bg-warning");
    $(`span[source=badges]`).removeClass("bg-danger");
    $(`span[source=badges]`).html("");
  }
}
