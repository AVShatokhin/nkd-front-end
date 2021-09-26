function initControl() {
  $("#btn__send_diagn_command").click((event) => {
    sendAjax(
      "/get_control/cmd",
      { cmd: "diagn", params: "{6e665fe4-3d53-4d19-bbee-f80a023677f4}" },
      (result) => {
        var result = JSON.parse(result);
        if (result.status.success != true) {
          // console.log(result.success);
          showMessage("Ошибка на сервере!", "danger");
        } else {
          showMessage("Команда принята!", "success");
        }
      },
      (result) => {
        showMessage("Ошибка на сервере!", "danger");
      }
    );
  });
}
