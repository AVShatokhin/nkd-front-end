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
