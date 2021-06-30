class mnemo {
  // ===================== PUBLIC
  constructor(mnemo_config, target, model) {
    this.mnemo_config = mnemo_config;
    this.target = target;
    this.model = model;
  }

  set mnemo_config(value) {
    this._mnemo_config = value;
  }

  set target(value) {
    this._target = value;
  }

  set model(value) {
    this._model = value;
  }

  plot() {
    for (let __uuid in this._mnemo_config) {
      let __class = this._model.getMnemoData(__uuid);
      this._mnemo_config[__uuid].forEach((__id) => {
        $(`#${__id}`).removeAttr("class");
        $(`#${__id}`).addClass(__class);
      });
    }
  }
}
