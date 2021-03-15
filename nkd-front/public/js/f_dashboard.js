$(function () {
  get_left_menu();
  get_main();

  initPasswordDialogs(); // в f_common.js
  initProfile(); // в f_common.js
  initClient(); // в f_client.js

  function get_left_menu() {
    sendAjaxGet(
      "dashboard/get_left_menu",
      (res) => {
        $("ul#menu__left").append(res);

        $(".my_bnt__left_menu").click((e) => {
          var mid = $(e.currentTarget).attr("mid");
          get_tab_options(mid);
        });

        $("#btn__show_main").click((e) => {
          get_main();
        });

        $("#btn__test").click((e) => {
          $("svg#o_1 > rect#back").attr("fill", "#00ff00");
          $("svg#o_2 > rect#back").attr("fill", "#ff0000");
        });
      },
      () => {
        showMessage("Ошибка загрузки приложения!", "danger");
      }
    );
  }

  function get_main() {
    sendAjaxGet(
      `dashboard/get_main/`,
      (res) => {
        $("#dashboard_main_content").empty();
        $("#dashboard_main_content").html(res);

        get_mnemo();
      },
      () => {
        showMessage("Ошибка загрузки приложения!", "danger");
      }
    );
  }

  function get_mnemo() {
    sendAjaxGet(
      `dashboard/get_mnemo/`,
      (res) => {
        $("#mnemo_container").empty();
        $("#mnemo_container").html(res);

        $("#svg_2").click((e) => {
          alert(1);
        });
      },
      () => {
        showMessage("Ошибка загрузки приложения!", "danger");
      }
    );
  }
});
