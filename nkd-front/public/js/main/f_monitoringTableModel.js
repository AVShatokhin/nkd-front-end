class monitoringTableModel {
  // ===================== PUBLIC
  constructor(params) {
    this._configs = params.configs;

    this._ColCount = 4;
    this._RowCount = 9;
    this._ColHeaders = [
      "Наименование параметра",
      "ГОСТ 10816",
      "Значение",
      "Единицы измерения",
    ];
    this._ColWidths = [35, 15, 15, 15];

    this._moto_0 = "-";
    this._moto_1 = "-";
    this._active_gear = undefined;
    this._tacho = "-";
    this._signal1 = "-";
    this._signal2 = "-";
    this._signal3 = "-";
    this._speed_zone = "-";
    this._badges = {};
  }

  get ColCount() {
    return this._ColCount;
  }

  get ColWidths() {
    return this._ColWidths;
  }

  get ColHeaders() {
    return this._ColHeaders;
  }

  get RowCount() {
    return this._RowCount;
  }

  getData(col, row) {
    let __result;

    switch (col) {
      case 0:
        switch (row) {
          case 0:
            __result = "Наработка редуктора 1 ";
            if (this._active_gear == 0) {
              __result += `<span class="badge bg-primary p-2 d-inline">Активный</span>`;
            }
            break;
          case 1:
            __result = "Наработка редуктора 2 ";
            if (this._active_gear == 1) {
              __result += `<span class="badge bg-primary p-2 d-inline">Активный</span>`;
            }
            break;
          case 2:
            __result = "Частота вращения первичного вала";
            break;
          case 3:
            __result = "Расчетная скорость дороги";
            break;
          case 4:
            __result = `Датчик вибрации "${
              this._configs.signals?.signal1?.name || "-"
            }"`;
            break;
          case 5:
            __result = `Датчик вибрации "${
              this._configs.signals?.signal2?.name || "-"
            }"`;
            break;
          case 6:
            __result = `Датчик вибрации "${
              this._configs.signals?.signal3?.name || "-"
            }"`;
            break;
          case 7:
            __result = `Время последнего обновления`;
            break;
          case 8:
            __result = `Адрес источника`;
            break;
          default:
            __result = ``;
            break;
        }
        break;
      case 1:
        switch (row) {
          case 4:
            __result = this._badges?.signal1 || "-";
            break;
          case 5:
            __result = this._badges?.signal2 || "-";
            break;
          case 6:
            __result = this._badges?.signal3 || "-";
            break;
          default:
            __result = "";
            break;
        }
        break;
      case 2:
        switch (row) {
          case 0:
            __result = this._calcMoto(
              this._moto_0,
              this._configs.signals.cnt.moto_factor
            );
            break;
          case 1:
            __result = this._calcMoto(
              this._moto_1,
              this._configs.signals.cnt.moto_factor
            );
            break;
          case 2:
            __result = this._signals?.tacho || "-";
            break;
          case 3:
            __result = this._signals?.speed_zone || "-";
            break;
          case 4:
            __result = this._signals?.signal1 || "-";
            break;
          case 5:
            __result = this._signals?.signal2 || "-";
            break;
          case 6:
            __result = this._signals?.signal3 || "-";
            break;
          case 7:
            __result = new Date(this._ts * 1000).toLocaleString("ru", {
              timezone: "UTC",
              hour: "numeric",
              minute: "numeric",
              second: "numeric",
              year: "numeric",
              month: "numeric",
              day: "numeric",
            });
            break;
          case 8:
            __result = this._remoteAddress;
            break;

          default:
            __result = "";
            break;
        }
        break;
      case 3:
        switch (row) {
          case 0:
            __result = "мото [часы : минуты]";
            break;
          case 1:
            __result = "мото [часы : минуты]";
            break;
          case 2:
            __result = "Гц";
            break;
          case 3:
            __result = "м / с";
            break;
          case 4:
            __result = "мм/с";
            break;
          case 5:
            __result = "мм/с";
            break;
          case 6:
            __result = "мм/с";
            break;
          default:
            __result = ``;
            break;
        }
        break;
      default:
        __result = ``;
        break;
    }

    return __result;
  }

  set moto_0(value) {
    this._moto_0 = value;
    this._view.plot();
  }

  set moto_1(value) {
    this._moto_1 = value;
    this._view.plot();
  }

  set active_gear(value) {
    this._active_gear = value;
    this._view.plot();
  }

  set ts(value) {
    this._ts = value;
    this._view.plot();
  }

  set remoteAddress(value) {
    this._remoteAddress = value;
    this._view.plot();
  }

  set signals(value) {
    this._signals = value;
    this._view.plot();
  }

  set badges(value) {
    let __type = {
      A: "bg-primary",
      B: "bg-success",
      C: "bg-warning",
      D: "bg-danger",
    };

    for (let signal in value) {
      this._badges[signal] = this._badge(
        __type[value[signal]],
        `Зона ${value[signal]}`
      );
    }

    this._view.plot();
  }

  set view(value) {
    this._view = value;
  }

  _calcMoto(moto, factor) {
    let m_sec = moto * factor;
    let m_min = Math.trunc(m_sec / 60);
    let m_hour = Math.trunc(m_min / 60);

    m_min = m_min - m_hour * 60;

    if (m_min < 10) {
      m_min = "0" + m_min;
    }

    return `${m_hour} : ${m_min}`;
  }

  _badge(type, content) {
    return `<span class="badge ${type} p-2">${content}</span>`;
  }
}
