class dresult_model {
  // ===================== PUBLIC
  constructor(savedNode, yellow_table, signals, treetable__currentResult) {
    this._signals = signals;
    this._names = [];
    this._sids = [];
    this._yellow_table = yellow_table;
    this._savedNode = savedNode;
    this._subListData = {};

    for (let __sid in this._signals) {
      if (this._signals[__sid]?.diagn) {
        this._names.push(this._signals[__sid].name);
        this._sids.push(__sid);
      }
    }
    this._treetable__currentResult = treetable__currentResult;
    treetable__currentResult.model = this;
    treetable__currentResult.render();
    treetable__currentResult.plot();
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

  // setData(sid, uuid, value) {
  //   this._data[sid][uuid] = value;
  // }

  // setSubListData(uuid, sid, slid, object) {
  //   // уид объекта, уид сигнала, уид дефекта
  //   this._subList[uuid][sid][slid] = object;
  // }

  getData(uuid, sid) {
    if (this._subListData?.[`{${uuid}}`]?.[sid]) {
      let __cell = this._subListData?.[`{${uuid}}`]?.[sid];

      let __yes = 0;
      let __suspicion = 0;

      for (let __slid in __cell) {
        if (__cell[__slid].main == "yes") __yes = __yes + 1;
        if (__cell[__slid].main == "suspicion") __suspicion++;
      }

      return this._container(
        `Обнаружено : ${__yes}; Под подозрением : ${__suspicion}`
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

  update(diagn) {
    this._subListData = diagn.content;
    this._treetable__currentResult.plot();
  }

  // private
  _container(content) {
    return `<div class="div__treetable_content">${content}</div>`;
  }

  _header_container(content) {
    return `<div class="div__treetable_header">${content}</div>`;
  }
}
