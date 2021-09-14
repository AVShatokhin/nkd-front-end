class datatable {
  // ===================== PUBLIC
  constructor(opts) {
    this._target = opts.target;
    this._model = opts.model;
    $(`#${opts.requestButtonID}`).on("click", (e) => {
      this._model.clearStorage();
      this.render();
    });
    this.render();
  }

  render() {
    this._clear();
    this._createTable();
    this._initJQuery();
  }

  // ================ PRIVATE
  _createTable() {
    let __header = "";

    for (let i = 0; i < this._model.ColHeaders.length; i++) {
      __header += `<th width="${this._model.ColWidths[i]}%">${this._model.ColHeaders[i]}</th>`;
    }

    $("#" + this._target).append(
      `<table id="table__${this._target}" class="table table-striped" style="width:100%"><thead><tr>${__header}</tr></thead>` +
        `<tfoot><tr>${__header}</tr ></tfoot></table>`
    );
  }

  _initJQuery() {
    let __columns = [];
    this._model.ColHeaders.forEach((element) => {
      __columns.push({ render: this._model.renderData });
    });

    this.table = $(`#table__${this._target}`).DataTable({
      dom: '<"top"iflp<"clear">>rt<"bottom"iflp<"clear">>',
      processing: true,
      serverSide: true,
      searching: false,
      ordering: false,
      columns: __columns,
      ajax: {
        url: this._model.url,
        data: this._model.reqData,
      },
      language: {
        decimal: "",
        emptyTable: "Выборка не дала результата",
        info: "Показано с _START_ по _END_ из _TOTAL_ записей",
        infoEmpty: "",
        infoFiltered: "Выбрано _MAX_ записей",
        infoPostFix: "",
        thousands: ",",
        lengthMenu: "Показывать по _MENU_ записей",
        loadingRecords: "Загрузка...",
        processing: "Обработка...",
        search: "Поиск:",
        zeroRecords: "Ничего не найдено",
        paginate: {
          first: "Первая",
          last: "Последняя",
          next: "Следующая",
          previous: "Предыдущая",
        },
        aria: {
          sortAscending: ": activate to sort column ascending",
          sortDescending: ": activate to sort column descending",
        },
      },
    });

    this.table.on("draw", () => {
      this._model.onDraw();
    });

    this.table.on("preXhr", () => {
      this._model.onpreXhr();
    });
  }

  _clear() {
    $(`#${this._target}`).html("");
  }
}
