function main() {
  $('input[name="datetimes"]').daterangepicker({
    timePicker24Hour: true,
    showDropdowns: true,
    linkedCalendars: false,
    timePicker: true,
    opens: "center",
    startDate: moment().startOf("hour").subtract(23, "hour"),
    endDate: moment().startOf("hour").add(1, "hour"),
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

  // хорошенько подчистить всё отладочное

  sendAjaxGet(
    "/api/text",
    (data) => {
      let income = JSON.parse(data);
      let diagns = income.diagns;
      let configs = income.configs;

      let i = 1;

      diagns.forEach((e) => {
        let test = new dresult_model(
          configs,
          new treetable(`result_${i}`, "minimized")
        );
        test.update(e.diagn);
        i++;
      });
    },
    (err) => {
      console.log(err);
    }
  );
}
