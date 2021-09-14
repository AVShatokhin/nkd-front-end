class object_parser {
  // ===================== PUBLIC
  constructor(params) {
    this._objectSortedList = [];
    this._objectHash = {};
    this._iterator(params, params.configs.savedNode.node, 0);
  }

  _iterator(params, node, level, parent) {
    if (node?.type == 3) {
      this._objectSortedList.push(this._tr(params, node, level, parent));
      this._objectHash[`${node.uuid}`] = this._tr(params, node, level, parent);
    }

    if ("node" in node) {
      if (node.node?.length > 0) {
        node.node.forEach((__node) =>
          this._iterator(params, __node, level + 1, node)
        );
      } else {
        this._iterator(params, node.node, level + 1, node);
      }
    }
  }

  _tr(params, node, level, parent) {
    node.parentName = parent.name;
    node.level = level;
    return node;
  }

  get objectSortedList() {
    return this._objectSortedList;
  }

  get objectHash() {
    return this._objectHash;
  }
}

module.exports = object_parser;
