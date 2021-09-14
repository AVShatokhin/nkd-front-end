class dresults_units_moto_array_model {
  // ===================== PUBLIC

  constructor() {
    this.ColHeaders = ["Редуктор №1", "Редуктор №2"];
    this.ColWidths = [50, 50];
    this.url = "/statistics/get_data_units_moto_by_jquery";
    return this;
  }

  reqData(d) {
    d.select__uuid = $("#select__uuid_moto").val();
    d.moto_begin = $("#input__unit_moto_begin").val();
    d.moto_end = $("#input__unit_moto_end").val();
    d.speed_zone = $("#speed_zone_unit_moto").val();
  }

  renderData(data, type, row, meta) {
    function __icons(index) {
      let __icons = {
        no: `<div class="m-0 p-0"><svg id="Слой_1" data-name="Слой 1" xmlns="http://www.w3.org/2000/svg" height="14" viewBox="0 0 16 16">
          <defs>
            <style>
              .cls-1 {
                fill: #ccc;
              }
            </style>
          </defs>
          <g>
            <path class="cls-1" d="M541.39,526l1.36,1a1,1,0,0,1,.25,1.41h0l-8.17,12.54a1.6,1.6,0,0,1-2.28.45l-.33-.23a1.61,1.61,0,0,1-.41-2.19l8.26-12.67a.93.93,0,0,1,1.32-.26Z" transform="translate(-527.17 -525.85)"/>
            <path class="cls-1" d="M527.44,534.83l1.1-1.14a.9.9,0,0,1,1.31,0h0l4.72,4.91a1.91,1.91,0,0,1,0,2.63l-.21.22a1.29,1.29,0,0,1-1.86,0l-5.06-5.26a1,1,0,0,1,0-1.36Z" transform="translate(-527.17 -525.85)"/>
          </g>
        </svg></div>`,
        yes: `<span class="m-0 p-1 badge bg-danger"><svg id="Слой_1" data-name="Слой 1" xmlns="http://www.w3.org/2000/svg" height="14" viewBox="0 0 40 16">
          <defs>
            <style>
              .cls-1 {
                fill: #ccc;
              }
            </style>
          </defs>
          <g>
            <g>
              <rect class="cls-1" y="3.29" width="15.31" height="12.71"/>
              <polygon class="cls-1" points="17.96 6.56 15.28 9.68 15.27 7.96 15.29 3.3 17.96 6.56"/>
              <polygon class="cls-1" points="17.94 12.91 15.29 15.99 15.26 14.28 15.26 9.67 17.94 12.91"/>
            </g>
            <g>
              <polygon class="cls-1" points="31.02 6.39 31.02 6.39 31.02 6.39 31.02 6.39 31.02 6.39"/>
              <polygon class="cls-1" points="31.02 6.39 31.02 6.39 31.02 6.39 31.02 6.39 31.02 6.39"/>
              <polygon class="cls-1" points="31.02 6.39 31.02 6.39 31.02 6.39 31.02 6.39 31.02 6.39"/>
            </g>
            <g>
              <rect class="cls-1" x="425.58" y="173.27" width="15.33" height="12.71" transform="translate(-401.3 -172.35) rotate(-0.12)"/>
              <polygon class="cls-1" points="22.03 9.48 24.71 6.35 24.73 8.07 24.72 12.73 22.03 9.48"/>
              <polygon class="cls-1" points="22.04 3.13 24.69 0.03 24.71 1.74 24.71 6.35 22.04 3.13"/>
            </g>
          </g>
        </svg></span>`,
        suspicion: `<span class="m-0 p-1 badge bg-warning"><svg id="Слой_1" data-name="Слой 1" xmlns="http://www.w3.org/2000/svg" height="14" width="30" viewBox="0 0 4 16">
          <defs>
            <style>
              .cls-1 {
                fill: #ccc;
              }
            </style>
          </defs>
          <g>
            <path class="cls-1" d="M104.4,403h-1.74a.82.82,0,0,1-.81-.84h0l-.19-10.05c0-.46.55-.58,1-.58h1.74c.45,0,1,.2,1,.66l-.21,10a.82.82,0,0,1-.81.84Z" transform="translate(-101.5 -391.5)"/>
            <path class="cls-1" d="M102.8,404.12h1.4a1.32,1.32,0,0,1,1.3,1.35v.68a1.33,1.33,0,0,1-1.3,1.35h-1.4a1.33,1.33,0,0,1-1.3-1.35v-.68A1.32,1.32,0,0,1,102.8,404.12Z" transform="translate(-101.5 -391.5)"/>
          </g>
        </svg></span>`,
        undefined: `-`,
        null: `-`,
      };
      return __icons[index];
    }

    function __myTime(ts) {
      return new Date(ts * 1000).toLocaleString("ru", {
        timezone: "UTC",
        hour: "numeric",
        minute: "numeric",
        second: "numeric",
        year: "numeric",
        month: "numeric",
        day: "numeric",
      });
    }

    function __calcMoto(moto, moto_factor) {
      let m_sec = moto * moto_factor;
      let m_min = Math.trunc(m_sec / 60);
      let m_hour = Math.trunc(m_min / 60);

      m_min = m_min - m_hour * 60;

      if (m_min < 10) {
        m_min = "0" + m_min;
      }
      return `${m_hour} : ${m_min}`;
    }

    function __createTable(__configs, __data) {
      let __header = "<th>Дефекты</th>";

      let __objectType = __configs.objectHash[__data.uuid].objectType;
      let __signals = __configs.hardware;
      let __deffects = __configs.yellow_table[__objectType].deffects;
      let __tbody = "";

      for (let __signal in __signals) {
        if (__signals[__signal].diagn == true) {
          __header =
            __header +
            `<th class="text-center">${__signals[__signal].name}</th>`;
        }
      }

      for (let _d_index in __deffects) {
        __tbody = __tbody + `<tr><th>${_d_index}) ${__deffects[_d_index]}</th>`;
        for (let __signal in __signals) {
          if (__signals[__signal].diagn == true) {
            let __results = __data?.wc?.[__signal];
            __tbody =
              __tbody +
              `<th class="text-center">${__icons(
                __results?.[_d_index]?.main
              )}</th>`;
          }
        }
        __tbody = __tbody + `</tr>`;
      }

      return (
        `<table class="table" style="width:100%"><thead><tr>${__header}</tr></thead>` +
        `<tbody>${__tbody}</tbody>` +
        `<tfoot><tr>${__header}</tr></tfoot></table>`
      );
    }

    function __appendRow(target, data) {
      let __temp = document.createElement("div");
      $(__temp).addClass("d-flex");
      $(__temp).addClass("flex-column");
      $(__temp).append(data);
      $(target).append(__temp);
    }

    function __calcMeta(__cell, __configs) {
      let __tempObject = document.createElement("div");
      $(__tempObject).addClass("d-flex");
      $(__tempObject).addClass("flex-row");
      $(__tempObject).addClass("justify-content-between");

      let __record_datetime = __myTime(__cell.record_ts);
      let __cell_datetime = __myTime(__cell.calc_ts);

      __appendRow(
        __tempObject,
        `<div class="p-1 text-center">Время записи</div>` +
          `<div class="p-1 text-center"><span class="badge bg-primary  p-2">${__record_datetime}</span></div>`
      );

      __appendRow(
        __tempObject,
        `<div class="p-1 text-center">Время расчета</div>` +
          `<div class="p-1 text-center"><span class="badge bg-primary  p-2">${__cell_datetime}</span</div>`
      );

      __appendRow(
        __tempObject,
        `<div class="p-1 text-center">Редуктор</div>` +
          `<div class="p-1 text-center"> <span class="badge bg-primary  p-2">${
            ["Редуктор №1", "Редуктор №2"][__cell.active_gear]
          }</span></div>`
      );

      __appendRow(
        __tempObject,
        `<div class="p-1 text-center">Наработка</div>` +
          `<div class="p-1 text-center"><span class="badge bg-primary p-2">${__calcMoto(
            __cell.moto,
            __configs.signals.cnt.moto_factor
          )}</span><span class="p-2">ЧЧ:ММ</span></div>`
      );

      __appendRow(
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

      __appendRow(
        __tempObject,
        `<div class="p-1 text-center">Скорость дороги</div>` +
          `<div class="p-1 text-center"><span class="badge bg-primary  p-2">${speed_zone}</span><span class="p-2">М/с</span></div>`
      );

      return __tempObject;
    }

    switch (type) {
      case "display":
        let __configs = JSON.parse(sessionStorage.getItem("configs"));
        let __cell = JSON.parse(data);
        let __tempObject = __calcMeta(__cell, __configs);

        if (meta.col == 0) {
          return (
            $(__tempObject).get(0).outerHTML +
            `<div class="d-flex flex-column">${__createTable(
              __configs,
              __cell.content
            )}</div>`
          );
        } else if (meta.col == 1) {
          if (data == "{}")
            return `<span class="badge bg-warning p-4 w-100">нет соотвествия</span>`;

          return (
            $(__tempObject).get(0).outerHTML +
            `<div class="d-flex flex-column">${__createTable(
              __configs,
              __cell.content
            )}</div>`
          );
        }
        break;
      default:
        return "";
        break;
    }
  }

  onDraw() {}

  onpreXhr() {}

  clearStorage() {}
}
