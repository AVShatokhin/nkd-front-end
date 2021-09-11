class dresults_moto_array_model {
  // ===================== PUBLIC

  constructor() {
    this.ColHeaders = ["Редуктор №1", "Редуктор №2"];
    this.ColWidths = [50, 50];
    this.url = "/statistics/get_moto_data_by_jquery";
  }

  reqData(d) {
    d.input__moto_begin = $("#input__moto_begin").val();
    d.input__moto_end = $("#input__moto_end").val();
    d.speed_zone = $("#speed_zone_moto").val();
  }

  renderData(data, type, row, meta) {
    switch (type) {
      case "display":
        let key;

        let __diagns = sessionStorage.getItem("diagns_moto");

        if (__diagns == null) {
          __diagns = [];
        } else {
          __diagns = JSON.parse(__diagns);
        }

        key = `div__gear_${meta.col}_${meta.row}`;
        __diagns.push({ key, data });

        sessionStorage.setItem("diagns_moto", JSON.stringify(__diagns));

        return `<div class="d-flex flex-column"><div id="${key}_meta"></div><div id="${key}"></div></div>`;
        break;

      default:
        return income;
        break;
    }
  }

  onDraw() {
    function appendRow(target, data) {
      let __temp = document.createElement("div");
      $(__temp).addClass("d-flex");
      $(__temp).addClass("flex-column");
      $(__temp).append(data);
      $(target).append(__temp);
    }

    function calcMeta(__cell, __configs) {
      let __tempObject = document.createElement("div");
      $(__tempObject).addClass("d-flex");
      $(__tempObject).addClass("flex-row");
      $(__tempObject).addClass("justify-content-between");

      let __record_datetime = new Date(__cell.record_ts * 1000).toLocaleString(
        "ru",
        {
          timezone: "UTC",
          hour: "numeric",
          minute: "numeric",
          second: "numeric",
          year: "numeric",
          month: "numeric",
          day: "numeric",
        }
      );

      let __cell_datetime = new Date(__cell.calc_ts * 1000).toLocaleString(
        "ru",
        {
          timezone: "UTC",
          hour: "numeric",
          minute: "numeric",
          second: "numeric",
          year: "numeric",
          month: "numeric",
          day: "numeric",
        }
      );

      appendRow(
        __tempObject,
        `<div class="p-1 text-center">Время записи</div>` +
          `<div class="p-1 text-center"><span class="badge bg-primary  p-2">${__record_datetime}</span></div>`
      );

      appendRow(
        __tempObject,
        `<div class="p-1 text-center">Время расчета</div>` +
          `<div class="p-1 text-center"><span class="badge bg-primary  p-2">${__cell_datetime}</span</div>`
      );

      appendRow(
        __tempObject,
        `<div class="p-1 text-center">Редуктор</div>` +
          `<div class="p-1 text-center"> <span class="badge bg-primary  p-2">${
            ["Редуктор №1", "Редуктор №2"][__cell.active_gear]
          }</span></div>`
      );

      let moto_factor = __configs.signals.cnt.moto_factor;
      let m_sec = __cell.moto * moto_factor;
      let m_min = Math.trunc(m_sec / 60);
      let m_hour = Math.trunc(m_min / 60);

      m_min = m_min - m_hour * 60;

      if (m_min < 10) {
        m_min = "0" + m_min;
      }

      appendRow(
        __tempObject,
        `<div class="p-1 text-center">Наработка</div>` +
          `<div class="p-1 text-center"><span class="badge bg-primary p-2">${`${m_hour} : ${m_min}`}</span><span class="p-2">ЧЧ:ММ</span></div>`
      );

      appendRow(
        __tempObject,
        `<div class="p-1 text-center">Частота</div>` +
          `<div class="p-1 text-center"><span class="badge bg-primary  p-2">${__cell.freq}</span><span class="p-2">Гц</span></div>`
      );

      let speed_zone;
      for (let sz in __configs.signals.tacho.speed_zones) {
        if (
          (__cell.freq > __configs.signals.tacho.speed_zones[sz].begin) &
          (__cell.freq <= __configs.signals.tacho.speed_zones[sz].end)
        ) {
          speed_zone = sz;
        }
      }

      appendRow(
        __tempObject,
        `<div class="p-1 text-center">Скорость дороги</div>` +
          `<div class="p-1 text-center"><span class="badge bg-primary  p-2">${speed_zone}</span><span class="p-2">М/с</span></div>`
      );

      return __tempObject;
    }

    let __diagns = sessionStorage.getItem("diagns_moto");
    let __configs = JSON.parse(sessionStorage.getItem("configs"));

    // console.log(__configs);

    if (__diagns != null) {
      __diagns = JSON.parse(__diagns);
      __diagns.forEach((element) => {
        let __cell = JSON.parse(element.data);
        if (__cell?.content == null) {
          $(`#${element.key}_meta`).html("");
          $(`#${element.key}_meta`).append(
            `<span class="badge bg-warning p-4 w-100">нет соотвествия</span>`
          );
        } else {
          let __content = JSON.parse(__cell.content);

          $(`#${element.key}_meta`).html("");
          $(`#${element.key}_meta`).append(calcMeta(__cell, __configs));

          new dresult_model({
            configs: __configs,
            treetable: new treetable(element.key),
            initData: { content: __content },
          });
        }
      });
    }
    this.clearStorage();
  }

  onpreXhr() {
    this.clearStorage();
  }

  clearStorage() {
    sessionStorage.removeItem("diagns_moto");
  }
}
