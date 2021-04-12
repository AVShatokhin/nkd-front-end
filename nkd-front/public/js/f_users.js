$(function () {
  $(".select_dostup").change((event) => {
    let uid = $(event.target).attr("uid");
    $(`#div__select_dostup_${uid}`).removeClass("col-12");
    $(`#div__select_dostup_${uid}`).addClass("col-6");
    $(`#div__btn_dostup_apply_${uid}`).removeClass("d-none");
  });

  $(".btn__dostup_change").click((event) => {
    let uid = $(event.target).attr("uid");
    sendAjaxForm(
      "/change_role",
      `form__dostup_${uid}`,
      (result) => {
        var result = JSON.parse(result);
        if (result.success != true) {
          showMessage("Ошибка на сервере!", "danger");
        } else {
          showMessage("Уровень доступа изменён!", "success");
          $(`#div__select_dostup_${uid}`).removeClass("col-6");
          $(`#div__select_dostup_${uid}`).addClass("col-12");
          $(`#div__btn_dostup_apply_${uid}`).addClass("d-none");
        }
      },
      (result) => {
        showMessage("Ошибка на сервере!", "danger");
      }
    );
  });

  $(".btn__reset_pwd").click((event) => {
    let uid = $(event.target).attr("uid");
    sendAjaxForm(
      "/reset_pwd",
      `form__reset_pwd_${uid}`,
      (result) => {
        var result = JSON.parse(result);
        if (result.success != true) {
          showMessage("Ошибка на сервере!", "danger");
        } else {
          showMessage("Запрос на смену пароля отправлен!", "success");
        }
      },
      (result) => {
        showMessage("Ошибка на сервере!", "danger");
      }
    );
  });

  $(".btn__delete_user").click((event) => {
    let uid = $(event.target).attr("uid");
    sendAjaxForm(
      "/delete_user",
      `form__delete_user_${uid}`,
      (result) => {
        var result = JSON.parse(result);
        if (result.success != true) {
          showMessage("Ошибка на сервере!", "danger");
        } else {
          showMessage("Пользователь удалён!", "success");
          $(`#tr__${uid}`).remove();
        }
      },
      (result) => {
        showMessage("Ошибка на сервере!", "danger");
      }
    );
  });
});
