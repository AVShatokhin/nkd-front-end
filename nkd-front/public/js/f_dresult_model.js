class dresult_model {
  // ===================== PUBLIC
  constructor(configs, treetable__currentResult, mnemo) {
    this._hardware = configs.hardware;
    this._yellow_table = configs.yellow_table;
    this._savedNode = configs.savedNode;
    this._records = configs.records;

    console.log(configs.records);

    this._signals = {};

    this._records[0].channels.forEach((__sid) => {
      if (this._hardware[__sid]?.diagn == true) {
        this._signals[__sid] = this._hardware[__sid];
      }
    });

    this._names = [];
    this._sids = [];
    this._subListData = {};

    for (let __sid in this._signals) {
      this._names.push(this._signals[__sid].name);
      this._sids.push(__sid);
    }
    this._treetable__currentResult = treetable__currentResult;
    treetable__currentResult.model = this;
    treetable__currentResult.render();
    treetable__currentResult.plot();

    this._mnemo = mnemo;
    mnemo.model = this;

    if (mnemo_ready) mnemo.plot();

    model_ready = true;
  }

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
          `Обнаружено : ${__yes}; Под подозрением : ${__suspicion}`,
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
    this._mnemo.plot();
  }

  update(diagn) {
    this._subListData = diagn.content;
    this._treetable__currentResult.plot();
    this._mnemo.plot();
  }

  // private
  _container(content) {
    return `<div class="div__treetable_content">${content}</div>`;
  }

  _header_container(content) {
    return `<div class="div__treetable_header">${content}</div>`;
  }

  _badge(content, type) {
    return `<span class="badge ${type} p-2">${content}</span>`;
  }
}
