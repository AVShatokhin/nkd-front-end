class treetable {
  // ===================== PUBLIC
  constructor(target, minimized) {
    this.target = target;
    this.minimized = minimized == "minimized" ? true : false;
  }

  set target(value) {
    this._target = value;
  }

  set model(value) {
    this._model = value;
  }

  render() {
    this._trace = []; // [{L/T/I/minimized/maximized}, {....}}
    this._parentStates = {}; // uuid -> maximized | minimized
    this._hasChildren = {}; // uuid -> bool "has children?"
    this._hasSublist = {}; // uuid -> bool "has sublist?"
    this._myChildren = {}; // uuid -> [uuidChild, .... ]
    this._myParent = {}; // uuid -> parentUUID
    this._mySubList = {}; // uuid -> { "1" : "sdsdf", ....... }
    this._subListStates = {}; // uuid -> maximized_list | minimized_list
    this._uuids = [];

    this._clear();
    this._createTable();
    this._itter(this._model.savedNode, "root", 0, "ROOT_UUID");
    this._calcSpacers();
    this._bindButtons();
  }

  plot() {
    this._uuids.forEach((__uuid) => {
      let __sublist = this._mySubList[__uuid];

      for (let i = 0; i < this._model.ColCount; i++) {
        $(
          `#span__${this._target}_cols_${__uuid}_${this._model.ColIDs[i]}`
        ).html(this._model.getData(__uuid, this._model.ColIDs[i])); // строка - столбец

        if (this._hasSublist[__uuid]) {
          for (let __slid in __sublist) {
            $(
              `#span__${this._target}_cols_${__uuid}_${this._model.ColIDs[i]}_sublist_${__slid}`
            ).html(
              this._model.getSubListData(__uuid, this._model.ColIDs[i], __slid)
            );
          }
        }
      }
    });
  }

  // ================ PRIVATE
  _clear() {
    $(`#${this._target}`).html("");
  }

  _createTable() {
    let __header = "";

    for (let i = 0; i < this._model.ColCount; i++) {
      __header += `<th>${this._model.ColHeaders[i]}</th>`;
    }

    $("#" + this._target).append(
      `<table class="table"><thead><tr><th width="${this._model.TreeWidth}%">${this._model.TreeHeader}</th>${__header}</tr></thead><tbody id="tbody__${this._target}_result"></tbody></table>`
    );
  }

  _itter(node, parentUUID, index) {
    node = this._preProc(node); // выполняем предобработку узла

    if (node?.length > 0) {
      // если это массив делаем перебор
      node.forEach((e) => {
        this._itter(e, parentUUID, index);
      });
    } else {
      if (node.name != undefined) {
        // проверям валидность ноды (нужно ли её отражать в таблице, без имени не надо её отображать)
        let hasChildren = node?.node != undefined; // проверяем есть ли в данной ноде вложенные ноды (или массивы нод)
        if (node.type != 4)
          this._createClement(node, index, hasChildren, parentUUID);
      }

      if ("node" in node) {
        // если есть ещё что-то - делаем вызов
        this._itter(node.node, node.uuid, index + 1);
      }
    }
  }

  _preProc(node) {
    // преобразцем все поступающие уиды в форму, не содержащуу фигурные скобки.
    node.uuid = node.uuid?.replace(/[{,}]/g, "");
    return node;
  }

  _createClement(node, index, hasChildren, parentUUID) {
    if (hasChildren) {
      // можно вынести за пределы
      if (this.minimized) {
        this._parentStates[node.uuid] = "minimized";
      } else {
        this._parentStates[node.uuid] = "maximized";
      }
    }

    this._hasChildren[node.uuid] = hasChildren;

    this._trace.push(index);
    this._uuids.push(node.uuid);
    this._myParent[node.uuid] = parentUUID;

    if (this._myChildren[parentUUID] == undefined) {
      this._myChildren[parentUUID] = [];
    }
    this._myChildren[parentUUID].push(node.uuid);

    let __name = hasChildren ? "<i>" + node.name + "</i>" : node.name;
    let __sublist = this._model.getSubList(node); //_yellow_table?.[node.objectType]?.deffects; // заменить на внешний вызов подлиста

    if (__sublist) {
      this._hasSublist[node.uuid] = true;
      this._mySubList[node.uuid] = __sublist;
      this._subListStates[node.uuid] = "minimized_list";
    }

    let __tableBody = $(`#tbody__${this._target}_result`);

    let __tableNode_TDs = "";

    for (let i = 0; i < this._model.ColCount; i++) {
      __tableNode_TDs += `<td style="padding: 0px;"><span id="span__${this._target}_cols_${node.uuid}_${this._model.ColIDs[i]}"><span></td>`;
    }

    let __visibility;
    if (this._parentStates[parentUUID] == "minimized") {
      __visibility = `style="display: none;"`;
    }

    __tableBody.append(
      `<tr id="tr__${this._target}_treetable_${node.uuid}" ${__visibility}>` +
        `<td style="padding: 0px;">` +
        `<span id="span__${this._target}_treetable_spacer_${node.uuid}"></span>` +
        `<span style="padding-left:.75rem; padding-right:.75rem">${__name}</span>` +
        `<span id="span__${this._target}_treetable_suffix_${node.uuid}"></span>` +
        `</td>${__tableNode_TDs}</tr>`
    );

    for (let __slid in __sublist) {
      let __tableSublist_TDs = "";

      for (let i = 0; i < this._model.ColCount; i++) {
        __tableSublist_TDs += `<td style="padding: 0px;"><span id="span__${this._target}_cols_${node.uuid}_${this._model.ColIDs[i]}_sublist_${__slid}"></span></td>`;
      }
      __tableBody.append(
        `<tr id="tr__${this._target}_treetable_${node.uuid}_sublist_${__slid}" style="display: none;">` +
          `<td nowrap style="padding: 0px;">` +
          `<span id="span__${this._target}_treetable_spacer_${node.uuid}_sublist_${__slid}" style="padding-right:.25rem;"></span>` +
          `<span style="padding-left:.75rem;">${__sublist[__slid]}</span>` +
          `</td>${__tableSublist_TDs}</tr>`
      );
    }
  }

  _calcSpacers() {
    let __spacers = {};

    for (let i = this._uuids.length; i >= 0; i--) {
      __spacers = this._spacerCalc(this._trace[i], __spacers);

      let __span = $(
        `#span__${this._target}_treetable_spacer_${this._uuids[i]}`
      );

      for (let __sp in __spacers) {
        __span.append(this._spanWrap(this._icons(__spacers[__sp])));
      }

      if (this._hasChildren[this._uuids[i]]) {
        __span.append(
          this._spanWrap(
            this._icons(this._parentStates[this._uuids[i]], this._uuids[i])
          )
        );
      }

      if (this._hasSublist[this._uuids[i]]) {
        $(`#span__${this._target}_treetable_suffix_${this._uuids[i]}`).append(
          this._spanWrap(
            this._icons(
              this._subListStates[this._uuids[i]],
              "sublist_" + this._uuids[i]
            )
          )
        );
      }

      if (this._hasSublist[this._uuids[i]]) {
        for (let __slid in this._mySubList[this._uuids[i]]) {
          let __span_sublist = $(
            `#span__${this._target}_treetable_spacer_${this._uuids[i]}_sublist_${__slid}`
          );

          let __sublist_spacers = this._sublistSpacersCalc(__spacers);
          for (let __sp in __sublist_spacers) {
            __span_sublist.append(
              this._spanWrap(this._icons(__sublist_spacers[__sp]))
            );
          }

          if (this._hasChildren[this._uuids[i]]) {
            __span_sublist.append(this._icons("i"));
          }

          __span_sublist.append(this._icons(" "));
          __span_sublist.append(this._icons(`${__slid})`));
        }
      }
    }
  }

  _sublistSpacersCalc(mainSpacers) {
    let __spacers = {};

    for (let __sp in mainSpacers) {
      if (mainSpacers[__sp] == "I" || mainSpacers[__sp] == "T") {
        __spacers[__sp] = "i";
      } else {
        __spacers[__sp] = " ";
      }
    }

    return __spacers;
  }

  _spanWrap(content) {
    return `<span style="display: inline-block; width: 20px;">${content}</span>`;
  }

  _spacerCalc(index, oldSpacer) {
    let __spacer = {};

    for (let i = 0; i < index; i++) {
      if (i == index - 1) {
        if (oldSpacer[i] == "L" || oldSpacer[i] == "T") {
          __spacer[i] = "T";
        } else if (oldSpacer[i] == " " || oldSpacer[i] == undefined) {
          __spacer[i] = "L";
        } else {
          __spacer[i] = "T";
        }
      } else {
        if (oldSpacer[i] == "L" || oldSpacer[i] == "T") {
          __spacer[i] = "I";
        } else {
          __spacer[i] = oldSpacer[i] || " ";
        }
      }
    }
    return __spacer;
  }

  _bindButtons() {
    for (let __uuid in this._parentStates) {
      $(`#svg__${this._target}_button_${__uuid}`).click(() => {
        this._buttonClick(__uuid);
      });
    }

    for (let __uuid in this._subListStates) {
      $(`#svg__${this._target}_button_sublist_${__uuid}`).click(() => {
        this._buttonSublistClick(__uuid);
      });
    }
  }

  _buttonSublistClick(__uuid) {
    if (this._subListStates[__uuid] == "maximized_list") {
      this._hideSubList(__uuid);
      this._subListStates[__uuid] = "minimized_list";
    } else {
      // 'minimized'
      this._subListStates[__uuid] = "maximized_list";
      this._showSubList(__uuid);
    }

    $(`#svg__${this._target}_button_sublist_${__uuid}`).replaceWith(
      this._icons(this._subListStates[__uuid], "sublist_" + __uuid)
    );

    $(`#svg__${this._target}_button_sublist_${__uuid}`).click(() => {
      this._buttonSublistClick(__uuid);
    });
  }

  _buttonClick(__uuid) {
    if (this._parentStates[__uuid] == "maximized") {
      this._hideNode(__uuid);
      this._parentStates[__uuid] = "minimized";
    } else {
      // 'minimized'
      this._parentStates[__uuid] = "maximized";
      this._showNode(__uuid);
    }

    $(`#svg__${this._target}_button_${__uuid}`).replaceWith(
      this._icons(this._parentStates[__uuid], __uuid)
    );

    $(`#svg__${this._target}_button_${__uuid}`).click(() => {
      this._buttonClick(__uuid);
    });
  }

  _hideSubList(uuid) {
    for (let __slid in this._mySubList[uuid]) {
      $(`#tr__${this._target}_treetable_${uuid}_sublist_${__slid}`).hide();
    }
  }

  _showSubList(uuid) {
    for (let __slid in this._mySubList[uuid]) {
      $(`#tr__${this._target}_treetable_${uuid}_sublist_${__slid}`).show();
    }
  }

  _hideNode(__uuid, selfHide) {
    if (this._myChildren[__uuid] != undefined) {
      this._myChildren[__uuid].forEach((e) => {
        this._hideNode(e, true);
      });
      if (selfHide) {
        $(`#tr__${this._target}_treetable_${__uuid}`).hide();
        if (this._hasSublist[__uuid]) this._hideSubList(__uuid);
      }
    } else {
      $(`#tr__${this._target}_treetable_${__uuid}`).hide();
      if (this._hasSublist[__uuid]) this._hideSubList(__uuid);
    }
  }

  _showNode(__uuid) {
    if (this._myChildren[__uuid] != undefined) {
      this._myChildren[__uuid].forEach((e) => {
        if (this._parentStates[__uuid] == "maximized") {
          this._showNode(e);
        }
      });
      $(`#tr__${this._target}_treetable_${__uuid}`).show();
      if (
        this._hasSublist[__uuid] &
        (this._subListStates[__uuid] == "maximized_list")
      )
        this._showSubList(__uuid);
    } else {
      $(`#tr__${this._target}_treetable_${__uuid}`).show();
      if (
        this._hasSublist[__uuid] &
        (this._subListStates[__uuid] == "maximized_list")
      )
        this._showSubList(__uuid);
    }
  }

  _icons(type, uuid) {
    let __common = `<svg id="svg__${this._target}_button_${uuid}" width="20" height="40" viewBox="0 0 20 40"xmlns="http://www.w3.org/2000/svg">`;

    switch (type) {
      case "i":
        return (
          `<svg width="20" height="25" viewBox="0 0 20 25" xmlns="http://www.w3.org/2000/svg">` +
          '<line x1="10" x2="10" y1="0" y2="25" stroke="white" fill="transparent" stroke-width="1"/>' +
          "</svg>"
        );
        break;

      case "T":
        return (
          __common +
          '<line x1="10" x2="10" y1="0" y2="40" stroke="white" fill="transparent" stroke-width="1"/>' +
          '<line x1="10" x2="20" y1="20" y2="20" stroke="white" fill="transparent" stroke-width="1"/>' +
          "</svg>"
        );
        break;

      case "L":
        return (
          __common +
          '<line x1="10" x2="10" y1="0" y2="20" stroke="white" fill="transparent" stroke-width="1"/>' +
          '<line x1="10" x2="20" y1="20" y2="20" stroke="white" fill="transparent" stroke-width="1"/>' +
          "</svg>"
        );
        break;

      case "I":
        return (
          __common +
          '<line x1="10" x2="10" y1="0" y2="40" stroke="white" fill="transparent" stroke-width="1"/>' +
          "</svg>"
        );
        break;

      case "minimized":
        return (
          __common +
          '<line x1="0" x2="3" y1="20" y2="20" stroke="white" fill="transparent" stroke-width="1"/>' +
          '<line x1="6" x2="14" y1="20" y2="20" stroke="white" fill="transparent" stroke-width="1"/>' +
          '<line x1="10" x2="10" y1="15" y2="25" stroke="white" fill="transparent" stroke-width="1"/>' +
          '<line x1="17" x2="20" y1="20" y2="20" stroke="white" fill="transparent" stroke-width="1"/>' +
          '<rect x="3" y="12" width="14" height="16" stroke="white" fill="transparent" stroke-width="1">' +
          "</svg>"
        );
        break;

      case "maximized":
        return (
          __common +
          '<line x1="0" x2="3" y1="20" y2="20" stroke="white" fill="transparent" stroke-width="1"/>' +
          '<line x1="10" x2="10" y1="28" y2="40" stroke="white" fill="transparent" stroke-width="1"/>' +
          '<line x1="6" x2="14" y1="20" y2="20" stroke="white" fill="transparent" stroke-width="1"/>' +
          '<line x1="17" x2="20" y1="20" y2="20" stroke="white" fill="transparent" stroke-width="1"/>' +
          '<rect x="3" y="12" width="14" height="16" stroke="white" fill="transparent" stroke-width="1">' +
          "</svg>"
        );
        break;

      case "minimized_list":
        return (
          __common +
          `<polygon points="5,15 15,20 5,25" fill="white" stroke="white" stroke-width="1" />` +
          "</svg>"
        );
        break;

      case "maximized_list":
        return (
          __common +
          `<polygon points="5,15 15,15 10,25" fill="white" stroke="white" stroke-width="1" />` +
          "</svg>"
        );
        break;

      default:
        return type;
        break;
    }
  }
}
