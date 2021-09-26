class tableView {
  // ===================== PUBLIC
  constructor(opts) {
    this._target = opts.target;
    this._model = opts.model;
    this._model.view = this;
  }

  render() {
    // строим таблицу, в коотрую потом положим данные
    this._clear();
    this._createTable();
  }

  plot() {
    // модель вызывает это метод, намекая, что есть новые данные
    $(`tbody#tbody__${this._target}`).html(this._body());
  }

  // ================ PRIVATE
  _clear() {
    $(`#${this._target}`).html("");
  }

  _createTable() {
    let __header = "";

    for (let i = 0; i < this._model.ColCount; i++) {
      __header += `<th style="width:${this._model.ColWidths[i]}%;">${this._model.ColHeaders[i]}</th>`;
    }

    $("#" + this._target).append(
      `<table class="table table-striped">
        <thead>
          <tr>${__header}</tr>
          </thead>
        <tbody id="tbody__${this._target}">${this._body()}</tbody>
      </table>`
    );
  }

  _body() {
    let __result = "";
    for (let i = 0; i < this._model.RowCount; i++) {
      __result += "<tr>";
      for (let j = 0; j < this._model.ColCount; j++) {
        __result += `<td>${this._model.getData(j, i)}</td>`;
      }
      __result += "</tr>";
    }
    return __result;
  }
}
