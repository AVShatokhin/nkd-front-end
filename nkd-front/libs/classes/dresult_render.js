class dresult_render {
  // ===================== PUBLIC
  constructor(params) {
    this._trHeaderStyle = "background: #b0e0e6; border: 2px solid black;";
    this._trStyle = "border: 1px solid black;";
    this._header = this._header(params);

    this._result = [];
    this._iterator(params, params.configs.savedNode.node, 0);
    this._html = this._container(params, this._result.join("\n\r"));
  }

  _header(params) {
    this._hardware_id = [];
    let __result = "";
    for (let __hardware_id in params.configs.hardware) {
      if (params.configs.hardware[__hardware_id].diagn) {
        __result =
          __result + `<th>${params.configs.hardware[__hardware_id].name}</th>`;
        this._hardware_id.push(__hardware_id);
      }
    }
    return __result + "\n\r";
  }

  _iterator(params, node, level) {
    this._result.push(this._tr(params, node, level));
    if ("node" in node) {
      if (node.node?.length > 0) {
        node.node.forEach((node) => this._iterator(params, node, level + 1));
      } else {
        this._iterator(params, node.node, level + 1);
      }
    }
  }

  _tr(params, node, level) {
    let __result = "";
    let __span = `<span style="padding-left:${level * 20}px;">`;
    let __spanDeffects = `<span style="padding-left:${level * 20 + 10}px;">`;
    let __yt = params.configs.yellow_table[node.objectType];
    let __object_name;

    if (__yt.object_name == "no type") {
      __object_name = "";
    } else {
      __object_name = " - " + __yt.object_name;
    }

    let __deffects_html = "";
    let __counter = {};

    if (__yt.object_name != "") {
      for (let __did in __yt.deffects) {
        let __deffects = this._resultsDeffects(params, node, __did, __counter);
        __deffects_html =
          __deffects_html +
          `<tr style="${this._trStyle}"><td>${__spanDeffects} ${__did}) ${__yt.deffects[__did]}</span>` +
          `${__deffects.html}</tr>`;
      }
    }

    __result =
      __result +
      `<tr style="${this._trStyle}"><td><b>${__span} ${node.name} ${__object_name}</b></span>` +
      `</td>${this._results(params, node, __counter)}</tr>`;

    return __result + __deffects_html;
  }

  _resultsDeffects(params, node, did, counter) {
    let html = "";
    let main = {};

    this._hardware_id.forEach((__hardware_id) => {
      let __cell = "-";

      if (counter[__hardware_id] == undefined) {
        counter[__hardware_id] = { yes: 0, suspicion: 0 };
      }

      main[__hardware_id] =
        params.diagn.content?.[node.uuid]?.[__hardware_id]?.[did] == undefined
          ? "-"
          : params.diagn.content[node.uuid][__hardware_id][did].main;

      switch (main[__hardware_id]) {
        case "no":
          __cell = `<span style="color:green">не обнаружен</span>`;
          break;

        case "yes":
          __cell = `<span style="color:red">обнаружен<span>`;

          counter[__hardware_id].yes++;
          break;

        case "suspicion":
          __cell = "под подозрением";
          counter[__hardware_id].suspicion++;
          break;

        default:
          break;
      }

      html = html + `<th>${__cell}</th>`;
    });
    return { html, main };
  }

  _results(params, node, counter) {
    let __result = "";
    this._hardware_id.forEach((__hardware_id) => {
      if (counter[__hardware_id] == undefined) {
        __result = __result + `<th></th>`;
      } else {
        let col = "green";
        if (counter[__hardware_id].suspicion > 0) col = "yellow";
        if (counter[__hardware_id].yes > 0) col = "red";

        __result =
          __result +
          `<th><span style="background-color:${col}; padding-left: 4px; padding-right: 4px; padding-top: 2px; padding-bottom: 2px; border-radius: 2px; color:white">` +
          `${counter[__hardware_id].yes} / ${counter[__hardware_id].suspicion}</span></th>`;
      }
    });
    return __result;
  }

  _container(params, tableContent) {
    return (
      `<table style="width:100%; border-collapse: collapse; border: 2px solid #000; margin-bottom: 30px;">` +
      `<thead><tr style="${this._trHeaderStyle}">` +
      `<th style="width:17%">Дата замера</th>` +
      `<th style="width:17%">Дата вычисления</th>` +
      `<th style="width:17%">Редуктор</th>` +
      `<th style="width:17%">Наработка, час:мин</th>` +
      `<th style="width:16%">Частота вращения, Гц</th>` +
      `<th style="width:16%">Скорость дороги, м/с</th>` +
      `</tr></thead>` +
      `<tbody><tr>` +
      `<th>${this._localtime(
        params.diagn.record_ts,
        params.configs.config.timezone_offset
      )}</th>` +
      `<th>${this._localtime(
        params.diagn.calc_ts,
        params.configs.config.timezone_offset
      )}</th>` +
      `<th>${["Редуктор №1", "Редуктор №2"][params.diagn.active_gear]}</th>` +
      `<th>${this._calcMoto(params, params.diagn.moto)}</th>` +
      `<th>${params.diagn.freq}</th>` +
      `<th>${params.diagn.speed_zone}</th>` +
      `</tr></tbody></table>` +
      `<table style="width:100%; border-collapse: collapse; border: 2px solid #000;">` +
      `<thead><tr style="${this._trHeaderStyle}"><th style="width:60%">Объёкты и дефекты</th>${this._header}</tr></thead>` +
      `<tbody>${tableContent}</tbody></table>`
    );
  }

  get html() {
    return this._html;
  }

  _localtime(ts, timezone_offset) {
    let localtime = new Date(
      (ts + timezone_offset * 3600) * 1000
    ).toLocaleString("ru", {
      timezone: "UTC",
      hour: "numeric",
      minute: "numeric",
      second: "numeric",
      year: "numeric",
      month: "numeric",
      day: "numeric",
    });

    return localtime;
  }

  _calcMoto(param, moto) {
    let moto_factor = param.configs.signals.cnt.moto_factor;
    let m_sec = moto * moto_factor;
    let m_min = Math.trunc(m_sec / 60);
    let m_hour = Math.trunc(m_min / 60);

    m_min = m_min - m_hour * 60;

    if (m_min < 10) {
      m_min = "0" + m_min;
    }

    return `${m_hour} : ${m_min}`;
  }

  // let configs = params.configs;
  // let initData = params.initData;

  // this._hardware = configs.hardware;
  // this._yellow_table = configs.yellow_table;
  // this._savedNode = configs.savedNode;
  // this._records = configs.records;
  // this._signals = {};

  // this._records[0].channels.forEach((__sid) => {
  //   if (this._hardware[__sid]?.diagn == true) {
  //     this._signals[__sid] = this._hardware[__sid];
  //   }
  // });

  // this._names = [];
  // this._sids = [];
  // this._subListData = {};

  // for (let __sid in this._signals) {
  //   this._names.push(this._signals[__sid].name);
  //   this._sids.push(__sid);
  // }
  // this._treetable__currentResult = treetable__currentResult;
  // treetable__currentResult.model = this;
  // treetable__currentResult.render();
  // treetable__currentResult.plot();

  // if (mnemo != undefined) {
  //   this._mnemo = mnemo;
  //   mnemo.model = this;

  //   if (mnemo_ready) mnemo.plot();

  //   model_ready = true;
  // }

  // if (initData != undefined) {
  //   this.update(initData);
  //   // console.log(initData);
  // }
  // }

  get savedNode() {
    return this._savedNode;
  }

  get ColCount() {
    return this._names.length;
  }

  get ColHeaders() {
    let __names = [];
    this._names.forEach((__name) => {
      __names.push(this._header_container(__name));
    });

    return __names;
  }

  get ColIDs() {
    return this._sids;
  }

  get TreeHeader() {
    return "Объекты и дефекты";
  }

  get TreeWidth() {
    return 40;
  }

  getData(uuid, sid) {
    if (this._subListData?.[`{${uuid}}`]?.[sid]) {
      let __cell = this._subListData?.[`{${uuid}}`]?.[sid];

      let __yes = 0;
      let __suspicion = 0;

      for (let __slid in __cell) {
        if (__cell[__slid].main == "yes") __yes++;
        if (__cell[__slid].main == "suspicion") __suspicion++;
      }

      let __badge_type = "bg-success";
      if (__suspicion > 0) __badge_type = "bg-warning";
      if (__yes > 0) __badge_type = "bg-danger";

      return this._container(
        this._badge(
          `${__yes} / ${__suspicion}`,
          // `Обнаружено : ${__yes}; Под подозрением : ${__suspicion}`,
          __badge_type
        )
      );
    } else {
      return this._container("Нет данных");
    }
  }

  getSubListData(uuid, sid, slid) {
    if (this._subListData?.[`{${uuid}}`]?.[sid]?.[slid]) {
      let __cell = this._subListData?.[`{${uuid}}`]?.[sid]?.[slid];
      return this._container(__cell.main);
    } else {
      return this._container("-");
    }
  }

  getSubList(node) {
    if (node.type != 3) return undefined;
    return this._yellow_table?.[node.objectType]?.deffects;
  }

  getMnemoData(uuid) {
    if (this._subListData[uuid]) {
      let __cellList = this._subListData[uuid];
      let __yes = 0;
      let __suspicion = 0;

      for (let __sid in __cellList) {
        let __cell = __cellList[__sid];

        for (let __slid in __cell) {
          if (__cell[__slid].main == "yes") __yes++;
          if (__cell[__slid].main == "suspicion") __suspicion++;
        }
      }

      if (__yes > 0) return "critical";
      if (__suspicion > 0) return "warning";
      return "ok";
    }

    return "default";
  }

  mnemoPlot() {
    if (mnemo != undefined) {
      this._mnemo.plot();
    }
  }

  update(diagn) {
    this._subListData = diagn.content;
    this._treetable__currentResult.plot();
    if (this._mnemo != undefined) {
      this._mnemo.plot();
    }
  }

  // private
  // _container(content) {
  //   return `<div class="div__treetable_content">${content}</div>`;
  // }

  _header_container(content) {
    return `<div class="div__treetable_header">${content}</div>`;
  }

  _badge(content, type) {
    return `<span class="badge ${type} p-2">${content}</span>`;
  }
}

module.exports = dresult_render;
