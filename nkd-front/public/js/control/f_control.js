function initControl() {
  $("#btn__send_diagn_command").click((event) => {
    sendAjax(
      "/control/cmd",
      { cmd: "diagn" },
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
