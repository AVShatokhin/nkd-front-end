class periodik_list_model {
  // ===================== PUBLIC
  constructor(target, data) {
    this._target = target;
    this._list = data.sort();
    this.render();
  }

  get data() {
    return this._list;
  }

  render() {
    this._clear();
    this._list = this._list.sort();
    this._renderList();
    this._linkElements();
  }

  removeItem(index) {
    this._list.splice(index, 1);
    this.render();
  }

  addItem(hour_select_id, min_select_id) {
    let new_hour = $(`#${hour_select_id}`).val();
    let new_min = $(`#${min_select_id}`).val();

    if (this.findItem(`${new_hour}:${new_min}`)) return;

    this._list.push(`${new_hour}:${new_min}`);
    this.render();
  }

  findItem(find) {
    let res = false;
    this._list.forEach((element) => {
      if (element == find) res = true;
    });
    return res;
  }
  // ================ PRIVATE
  _renderList() {
    let i = 0;
    this._list.forEach((element) => {
      let __listElement = new periodik_list_element(this, element, i++);
      $(`#${this._target}`).append(__listElement.html);
      __listElement.initHandlers();
    });
  }

  _linkElements() {}

  _clear() {
    $(`#${this._target}`).html("");
  }
}
