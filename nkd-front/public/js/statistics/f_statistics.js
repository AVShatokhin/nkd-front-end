function main() {
  _initDateRangePicker();

  $.get("/api/get_config/", {}).done((income) => {
    _start(income.data);
  });
}

function _start(configs) {
  sessionStorage.setItem("configs", JSON.stringify(configs));
  let __datatable = new datatable(
    "div__diagn_Date_Results_container",
    new dresults_array_model()
  );

  __datatable.render();
  _initEvents(__datatable);

  $("#btn__request_Date").on("click", (e) => {
    sessionStorage.removeItem("diagns");
    __datatable.render();
    _initEvents(__datatable);
  });
}

function _initEvents(datatable) {
  datatable.table.on("draw", () => {
    let __diagns = sessionStorage.getItem("diagns");
    let __configs = sessionStorage.getItem("configs");
    if (__diagns != null) {
      __diagns = JSON.parse(__diagns);
      __diagns.forEach((element) => {
        new dresult_model({
          configs: JSON.parse(__configs),
          treetable: new treetable(element.key),
          initData: { content: JSON.parse(element.data) },
        });
      });
    }
    sessionStorage.removeItem("diagns");
  });

  datatable.table.on("preXhr", () => {
    sessionStorage.removeItem("diagns");
  });
}

function _initDateRangePicker() {
  $('input[name="datetimes"]').daterangepicker({
    timePicker24Hour: true,
    showDropdowns: true,
    linkedCalendars: false,
    timePicker: true,
    opens: "center",
    startDate: moment().startOf("day").subtract(30, "day"),
    endDate: moment().startOf("day").add(1, "day"),
    locale: {
      format: "YYYY-MM-DD HH:mm:00",
      applyLabel: "Принять",
      cancelLabel: "Отмена",
      fromLabel: "с",
      toLabel: "до",
      firstDay: 1,
      daysOfWeek: ["Вс", "Пн", "Вт", "Ср", "Чт", "Пт", "Сб"],
      monthNames: [
        "Январь",
        "Февраль",
        "Март",
        "Апрель",
        "Май",
        "Июнь",
        "Июль",
        "Август",
        "Сентябрь",
        "Октябрь",
        "Ноябрь",
        "Декабрь",
      ],
    },
  });
}

// $.get("/statistics/get_stat/", {
//   input__request_dateTimeRange: $("#input__request_dateTimeRange").val(),
//   speed_zone: $("#speed_zone").val(),
//   active_gear: $("#active_gear").val(),
// }).done((income) => {
//   model.update(income.data);
// let counter = 1;
// income.data.forEach((e) => {
// $(`#${target}`).append(`<div id="div__diagn_result_${counter}"></div>`);
// new dresult_model({
//   configs,
//   treetable: new treetable(`div__diagn_result_${counter}`),
//   initData: e,
// });
// counter++;
// });
// console.log(income);
// });
// }
