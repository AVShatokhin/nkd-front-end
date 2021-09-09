function main() {
  _initDateRangePicker();

  $.get("/api/get_config/", {}).done((income) => {
    sessionStorage.setItem("configs", JSON.stringify(income.data));

    new datatable({
      target: "div__diagn_Date_Results_container",
      requestButtonID: "btn__request_Date",
      model: new dresults_array_model(),
    });

    new datatable({
      target: "div__diagn_Moto_Results_container",
      requestButtonID: "btn__request_moto",
      model: new dresults_moto_array_model(),
    });
  });
}

// function _start() {
//   // __datatable.render();
//   // _initEvents("diagns", __datatable);
//   // __datatable_moto.render();
//   // _initEvents("diagns_moto", __datatable_moto);
//   // $("#btn__request_Date").on("click", (e) => {
//   //   sessionStorage.removeItem("diagns");
//   //   __datatable.render();
//   //   _initEvents("diagns", __datatable);
//   // });
//   // $("#btn__request_moto").on("click", (e) => {
//   //   sessionStorage.removeItem("diagns_moto");
//   //   __datatable_moto.render();
//   //   _initEvents("diagns_moto", __datatable_moto);
//   // });
// }

// function _initEvents(link, datatable) {
//   datatable.table.on("draw", () => {
//     let __diagns = sessionStorage.getItem(`${link}`);
//     let __configs = sessionStorage.getItem("configs");
//     if (__diagns != null) {
//       __diagns = JSON.parse(__diagns);
//       __diagns.forEach((element) => {
//         new dresult_model({
//           configs: JSON.parse(__configs),
//           treetable: new treetable(element.key),
//           initData: { content: JSON.parse(element.data) },
//         });
//       });
//     }
//     sessionStorage.removeItem(`${link}`);
//   });

//   datatable.table.on("preXhr", () => {
//     sessionStorage.removeItem(`${link}`);
//   });
// }

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
