class periodik_list_element {
  // ===================== PUBLIC
  constructor(model, data, index) {
    this._model = model;
    this._index = index;

    let [hour, min] = data.split(":");
    this._html = this._container(
      `${this._container(hour, "span", "border p-2")} 
      ${this._container(":", "span", "p-2 flex-shrink-1")}  
      ${this._container(min, "span", "border p-2")}
      ${this._container(
        "Удалить",
        "button",
        "btn btn-secondary mx-2",
        `btn__delete_period_${index}`
      )}
      `,
      "div",
      "d-flex flex-row mb-3 justify-content-center align-content-around"
    );
  }

  get html() {
    return this._html;
  }

  initHandlers() {
    $(`#btn__delete_period_${this._index}`).on("click", (event) => {
      this._model.removeItem(this._index);
    });
  }

  // ================ PRIVATE
  _container(text, tag, classes, id) {
    let __html = `<${tag} id="${id}" class="${classes}">${text}</${tag}>`;
    return __html;
  }
}
