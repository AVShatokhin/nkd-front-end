class dresult_model {
  // ===================== PUBLIC
  constructor(params) {
    this.configs = params.configs;

    let configs = params.configs;
    let treetable__currentResult = params.treetable;
    let mnemo = params.mnemo;
    let initData = params.initData;
    // console.log(initData);

    this._hardware = configs.hardware;
    this._yellow_table = configs.yellow_table;
    this._savedNode = configs.savedNode;
    this._records = configs.records;
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

    if (mnemo != undefined) {
      this._mnemo = mnemo;
      mnemo.model = this;

      if (mnemo_ready) mnemo.plot();

      model_ready = true;
    }

    if (initData != undefined) {
      this.update(initData);
      // console.log(initData);
    }
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
        this._badge(`${__yes} / ${__suspicion}`, __badge_type)
      );
    } else {
      return this._container("Нет данных");
    }
  }

  getSubListData(uuid, sid, slid) {
    if (this._subListData?.[`{${uuid}}`]?.[sid]?.[slid]) {
      let __cell = this._subListData?.[`{${uuid}}`]?.[sid]?.[slid];
      return this._container(this._icons(__cell.main));
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

  // updateSignals(data) {
  //   this._signalsData = data;
  //   // this._mnemo.plot();
  //   this.mnemoPlot();
  // }

  // getSignals() {
  //   return this._signalsData;
  // }

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

  _icons(index) {
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
    };
    return __icons[index];
  }
}
