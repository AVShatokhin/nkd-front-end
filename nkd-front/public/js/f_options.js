$(function () {
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
});
