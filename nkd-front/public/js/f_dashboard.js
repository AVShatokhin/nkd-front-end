let mnemo_ready = false;
let model_ready = false;

$(function () {
  get_left_menu();

  initPasswordDialogs(); // в f_common.js
  initProfile(); // в f_common.js

  let ws_url = $("body").attr("ws_url");
  if (ws_url != undefined) initClient(ws_url);

  function get_left_menu() {
    sendAjaxGet(
      "dashboard/get_left_menu",
      (res) => {
        $("ul#menu__left").append(res);

        get_end_point("dashboard/get_main", get_mnemo);
        set_active("btn__show_main");

        $("#btn__show_main").click((e) => {
          get_end_point("dashboard/get_main", get_mnemo);
          set_active("btn__show_main");
        });

        $("#btn__show_monitoring").click((e) => {
          get_end_point("dashboard/get_monitoring", get_mnemo);
          set_active("btn__show_monitoring");
        });

        $("#btn__show_redchange").click((e) => {
          get_end_point("dashboard/get_redchange");
          set_active("btn__show_redchange");
        });

        $("#btn__show_options").click((e) => {
          get_end_point("options/get_options", (res) => {
            let ans = JSON.parse(res);
            $("#dashboard_main_content").empty();
            $("#dashboard_main_content").html(ans.data.html);
            initOptions(ans.data.options);
          });
          set_active("btn__show_options");
        });

        $("#btn__show_statistics").click((e) => {
          get_end_point("dashboard/get_statistics");
          set_active("btn__show_statistics");
        });

        $("#btn__show_users").click((e) => {
          get_end_point("get_users");
          set_active("btn__show_users");
        });

        $("#btn__show_control").click((e) => {
          get_end_point("dashboard/get_control");
          set_active("btn__show_control");
        });
      },
      () => {
        showMessage("Ошибка загрузки приложения!", "danger");
      }
    );
  }

  function get_end_point(end_point, callback) {
    sendAjaxGet(
      `${end_point}/`,
      (res) => {
        $("#dashboard_main_content").empty();
        $("#dashboard_main_content").html(res);
        // если загрузка энд-поинта завершилась удачно, то тогда
        if (callback != undefined) {
          callback(res);
        }
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

        mnemo_ready = true;

        if (model_ready) {
          treetable__currentResult_model.mnemoPlot();
        }
      },
      () => {
        showMessage("Ошибка загрузки приложения!", "danger");
      }
    );
  }

  function set_active(active) {
    $(".sidebar-item").removeClass("active");
    $(`#${active}`).parent().addClass("active");
  }
});
