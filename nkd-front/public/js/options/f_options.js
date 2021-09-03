function initOptions(configs) {
  $(".btn__send_form").click((event) => {
    let form = $(event.target).attr("form");
    sendAjaxForm(
      "/options/set_options",
      form,
      (result) => {
        var result = JSON.parse(result);
        if (result.success != true) {
          showMessage("Ошибка на сервере!", "danger");
        } else {
          showMessage("Конфигурация обновлена!", "success");
        }
      },
      (result) => {
        showMessage("Ошибка на сервере!", "danger");
      }
    );
  });

  // console.log(configs);

  let periodikList = new periodik_list_model(
    "div__periodik_list",
    configs.periodiks_collection.periodiks.value
  );
  $("#btn__add_periodik").on("click", (event) => {
    periodikList.addItem(
      "select__add_periodik_hour",
      "select__add_periodik_min"
    );
  });

  $("#btn__send_periodik_data").click((event) => {
    let __sendData = {};

    if (periodikList.data.length == 1) {
      __sendData["periodiks"] = `${periodikList.data[0]}`;
    } else {
      __sendData["periodiks"] = periodikList.data;
    }

    __sendData["link"] = "periodiks_collection";

    sendAjax(
      "/options/set_options",
      __sendData,
      (result) => {
        var result = JSON.parse(result);
        if (result.success != true) {
          showMessage("Ошибка на сервере!", "danger");
        } else {
          showMessage("Конфигурация обновлена!", "success");
        }
      },
      (result) => {
        showMessage("Ошибка на сервере!", "danger");
      }
    );
  });
}
