$(function () {
  $("#btn__change_password").on("click", () => {
    if ($("#newPassword").val() != $("#newPasswordConfirmation").val()) {
      showMessage("Пароли не совпадают!", "danger");
      return;
    }

    if ($("#newPassword").val().length < 6) {
      showMessage("Пароль слишком короткий, надо больше 6 символов!", "danger");
      return;
    }

    sendAjaxForm(
      "/changepass",
      "validation-form",
      (res) => {
        var result = JSON.parse(res);
        if (result.success != true) {
          showMessage("Ошибка на сервере!", "danger");
          $("#btn__go_to_site").addClass("disabled");
        } else {
          $("#btn__go_to_site").removeClass("disabled");
          showMessage("Пароль изменён!", "success");
        }
      },
      (res) => {
        showMessage("Ошибка на сервере!", "danger");
        $("#btn__go_to_site").addClass("disabled");
      }
    );
  });
});
