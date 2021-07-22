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

    this.plotSignals();
    this.plotBadges();
    this.plotActiveGear();
    this.plotMoto();
  }

  plotSignals(signalsData) {
    let signals;
    if (signalsData != undefined) {
      this._model.signals = signalsData;
      signals = signalsData;
    } else {
      signals = this._model.signals;
    }
    if (signals == undefined) return;

    let __signals = this._model.configs.signals;
    let __hardware = this._model.configs.hardware;
    for (let __signal in signals.data) {
      if (__signals[__signal] != undefined) {
        $(`text#text_${__signal}_value`).html(signals.data[__signal]);
        if (__signals[__signal].small_name != undefined) {
          $(`text#text_${__signal}_name`).html(__signals[__signal].small_name);
        } else {
          $(`text#text_${__signal}_name`).html(__signals[__signal].name);
        }
        $(`text#text_${__signal}_unit`).html(
          __hardware[__signals[__signal].hardware_id].unit
        );
      }
    }
    $(`text#text_speed_zone_unit`).html("м/с");
    $(`text#text_speed_zone_name`).html("Скорость дороги");
    $(`text#text_tacho_unit`).html("Гц");
    $(`text#text_speed_zone_value`).html(signals.data.speed_zone);
    // $(`text#text_tacho_value`).html(signals.data.tacho);
  }

  plotBadges(badgesData) {
    let badges;

    if (badgesData != undefined) {
      this._model.badges = badgesData;
      badges = badgesData;
    } else {
      badges = this._model.badges;
    }

    if (badges == undefined) return;

    let __signals = this._model.configs.signals;

    for (let __signal in badges) {
      if (__signals[__signal] != undefined) {
        $(`text#text_${__signal}_badge`).html(badges[__signal]);

        $(`rect#badge_${__signal}`).removeAttr("class");
        if ((badges[__signal] == "A") | (badges[__signal] == "B")) {
          $(`rect#badge_${__signal}`).addClass("ok");
        } else if (badges[__signal] == "C") {
          $(`rect#badge_${__signal}`).addClass("warning");
        } else if (badges[__signal] == "D") {
          $(`rect#badge_${__signal}`).addClass("critical");
        }
      }
    }
  }

  plotActiveGear(active_gearData) {
    let active_gear;

    if (active_gearData != undefined) {
      this._model.active_gear = active_gearData;
      active_gear = active_gearData;
    } else {
      active_gear = this._model.active_gear;
    }

    if (active_gear == undefined) return;

    $(`text#text_active_gear`).html(
      ["Редуктор №1", "Редуктор №2"][active_gear.active_gear]
    );
    this.plotMoto();
  }

  plotMoto(motoData) {
    let moto;

    if (motoData != undefined) {
      this._model.moto = motoData;
      moto = motoData;
    } else {
      moto = this._model.moto;
    }

    let __active_gear = this._model?.active_gear?.active_gear;
    if ((__active_gear == undefined) | (moto == undefined)) return;

    $(`text#text_moto_unit`).html("час : мин");

    if (__active_gear == 0) {
      $(`text#text_moto_value`).html(calcMoto(moto.moto_0, moto.moto_factor));
    } else {
      $(`text#text_moto_value`).html(calcMoto(moto.moto_1, moto.moto_factor));
    }
  }
}
