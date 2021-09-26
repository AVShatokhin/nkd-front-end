class leftMenu {
  // ===================== PUBLIC
  constructor(options) {
    this.__get_left_menu(options);
  }

  __get_left_menu(options) {
    sendAjaxGet(
      "dashboard/get_left_menu",
      (res) => {
        $("ul#menu__left").append(res);
        options.forEach((item) => {
          $(`#${item.id}`).click((e) => {
            get_end_point(item.end_point, item.callback);
            this.__set_active(item.id);
          });
          if (item.active == true) {
            this.__set_active(item.id);
          }
        });
      },
      () => {
        showMessage("Ошибка загрузки приложения!", "danger");
      }
    );
  }

  __set_active(active) {
    $(".sidebar-item").removeClass("active");
    $(`#${active}`).parent().addClass("active");
  }
}
