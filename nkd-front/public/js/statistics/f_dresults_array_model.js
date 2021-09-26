class dresults_array_model {
  // ===================== PUBLIC
  constructor() {
    this.ColHeaders = ["Реквизиты", "Результат"];
    this.ColWidths = [20, 80];
    this.url = "/get_diagn/get_data_by_jquery";
    this.link = "diagns";
  }

  reqData(d) {
    d.input__request_dateTimeRange = $("#input__request_dateTimeRange").val();
    d.speed_zone = $("#speed_zone").val();
    d.active_gear = $("#active_gear").val();
  }

  renderData(data, type, row, meta) {
    switch (type) {
      case "display":
        let __tempObject = document.createElement("div");
        if (meta.col == 1) {
          // дерево
          let __diagns = sessionStorage.getItem("diagns");

          if (__diagns == null) {
            __diagns = [];
          } else {
            __diagns = JSON.parse(__diagns);
          }

          let key = `div__resultDiagn_${meta.row}_${meta.col}`;

          __diagns.push({ key, data });

          sessionStorage.setItem("diagns", JSON.stringify(__diagns));

          return `<div id=${key}></div>`;
        } else {
          // реквизиты
          let __cell = JSON.parse(data);
          let __configs = JSON.parse(sessionStorage.getItem("configs"));

          let __record_datetime = new Date(
            __cell.record_ts * 1000
          ).toLocaleString("ru", {
            timezone: "UTC",
            hour: "numeric",
            minute: "numeric",
            second: "numeric",
            year: "numeric",
            month: "numeric",
            day: "numeric",
          });

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

          $(__tempObject).append(
            `<div class="p-1">Время записи : <span class="badge bg-primary  p-2">${__record_datetime}</span></div>`
          );
          $(__tempObject).append(
            `<div class="p-1">Время расчета : <span class="badge bg-primary  p-2">${__cell_datetime}</span</div>`
          );
          $(__tempObject).append(
            `<div class="p-1">Редуктор : <span class="badge bg-primary  p-2">${
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

          $(__tempObject).append(
            `<div class="p-1">Наработка, часы:минуты : <span class="badge bg-primary p-2">${`${m_hour} : ${m_min}`}</span></div>`
          );
          $(__tempObject).append(
            `<div class="p-1">Частота, Гц : <span class="badge bg-primary  p-2">${__cell.freq}</span></div>`
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

          $(__tempObject).append(
            `<div class="p-1">Скорость дороги, м/с : <span class="badge bg-primary  p-2">${speed_zone}</span></div>`
          );
        }
        return $(__tempObject).get(0).outerHTML;
        break;

      default:
        return data;
        break;
    }
  }

  onDraw() {
    let __diagns = sessionStorage.getItem(`${this.link}`);
    let __configs = sessionStorage.getItem("configs");
    if (__diagns != null) {
      __diagns = JSON.parse(__diagns);
      __diagns.forEach((element) => {
        new dresult_model({
          configs: JSON.parse(__configs),
          treetable: new treeListTableView(element.key),
          initData: { content: JSON.parse(element.data) },
        });
      });
    }
    this.clearStorage();
  }

  onpreXhr() {
    this.clearStorage();
  }

  clearStorage() {
    sessionStorage.removeItem("diagns");
  }
}
