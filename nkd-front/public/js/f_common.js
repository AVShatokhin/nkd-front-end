function sendAjaxForm(url, ajax_form, sucess_function, error_function) {
  $.ajax({
    url: url, //url страницы (action_ajax_form.php)
    // type: "POST", //метод отправки
    method: "POST", //метод отправки
    dataType: "html", //формат данных принимаемых обратно
    data: $("#" + ajax_form).serialize(), // Сеарилизуем объект
    success: sucess_function,
    error: error_function,
  });
}

function sendAjax(url, data, sucess_function, error_function) {
  $.ajax({
    url: url, //url страницы (action_ajax_form.php)
    // type: "POST", //метод отправки
    method: "POST", //метод отправки
    dataType: "html", //формат данных принимаемых обратно
    data,
    // data: JSON.stringify(data),
    // processData: false,
    success: sucess_function,
    error: error_function,
  });
}

async function sendAjaxData(url, formData, sucess_function, error_function) {
  let res = await fetch(url, {
    method: "POST",
    body: formData,
  });

  if (res.ok) {
    sucess_function(await res.text());
  } else {
    error_function();
  }
}

function sendAjaxGet(url, sucess_function, error_function) {
  // function __success(data) {
  //   console.log(data);
  //   sucess_function(data);
  // }

  $.ajax({
    url: url, //url страницы
    method: "GET", //метод отправки
    dataType: "html", //формат данных
    success: __success,
    error: error_function,
  });
}

function showMessage(text, type) {
  var message = text;
  var type = type;
  var duration = "15000";
  var ripple = true;
  var dismissible = true;
  var positionX = "left";
  var positionY = "bottom";
  window.notyf.open({
    type,
    message,
    duration,
    ripple,
    dismissible,
    position: {
      x: positionX,
      y: positionY,
    },
  });
}

function initPasswordDialogs() {
  $("#validation-form").validate({
    ignore: ".ignore, .select2-input",
    focusInvalid: false,
    rules: {
      "validation-password": {
        required: true,
        minlength: 6,
        maxlength: 20,
      },
      "validation-password-confirmation": {
        required: true,
        minlength: 6,
        equalTo: 'input[name="validation-password"]',
      },
    },
    // Errors
    errorPlacement: function errorPlacement(error, element) {
      var $parent = $(element).parents(".error-placeholder");
      //Do not duplicate errors
      if ($parent.find(".jquery-validation-error").length) {
        return;
      }
      $parent.append(
        error.addClass(
          "jquery-validation-error small form-text invalid-feedback"
        )
      );
    },
    highlight: function (element) {
      var $el = $(element);
      var $parent = $el.parents(".error-placeholder");
      $el.addClass("is-invalid");
      // Select2 and Tagsinput
      if (
        $el.hasClass("select2-hidden-accessible") ||
        $el.attr("data-role") === "tagsinput"
      ) {
        $el.parent().addClass("is-invalid");
      }
    },
    unhighlight: function (element) {
      $(element)
        .parents(".error-placeholder")
        .find(".is-invalid")
        .removeClass("is-invalid");
    },
  });

  $("#validation-password, #validation-password-confirmation").keyup(() => {
    if (
      $("#validation-password").val() ==
        $("#validation-password-confirmation").val() &&
      $("#validation-password").val().length >= 6
    ) {
      $("#btn__change_password").attr("disabled", false);
    } else {
      $("#btn__change_password").attr("disabled", true);
    }
  });

  $("#button__change_password_dialog").on("click", () => {
    $("#validation-form")[0].reset();
    $("#validation-password, #validation-password-confirmation")
      .parents(".error-placeholder")
      .find(".is-invalid")
      .removeClass("is-invalid");
    $("#btn__change_password").attr("disabled", true);
  });

  $("#btn__change_password").on("click", () => {
    sendAjaxForm(
      "/changepass",
      "validation-form",
      (res) => {
        var result = JSON.parse(res);
        if (result.success != true) {
          showMessage("Ошибка на сервере!", "danger");
        } else {
          showMessage("Пароль изменён!", "success");
        }
      },
      (res) => {
        showMessage("Ошибка на сервере!", "danger");
      }
    );
  });
}

function initProfile() {
  $("#btn__go_profile").on("click", () => {
    $("#dashboard_main_content").empty();
    sendAjaxGet(
      "/profile",
      (res) => {
        $("#dashboard_main_content").html(res);
        $("#input__ava_upload").change(readURL);

        $("#user_data").on("submit", (event) => {
          event.preventDefault();

          sendAjaxForm(
            "/change_user_data",
            "user_data",
            (res) => {
              var result = JSON.parse(res.toString());
              if (result.success != true) {
                showMessage("Ошибка на сервере!", "danger");
              } else {
                showMessage("Изменения сохранены!", "success");
              }
            },
            () => {
              showMessage("Ошибка на сервере!", "danger");
            }
          );
        });

        $("#btn__reset_ava").on("click", () => {
          sendAjaxGet(
            "/reset_ava",
            (res) => {
              var result = JSON.parse(res.toString());
              if (result.success != true) {
                showMessage("Ошибка на сервере!", "danger");
              } else {
                $("#img__avatar").attr("src", result.url);
                $("#img__ava_preview").attr("src", result.url);
                showMessage("Картинка удалена!", "success");
                $("#btn__upload_ava").attr("disabled", "disabled");
              }
            },
            () => {
              showMessage("Ошибка на сервере!", "danger");
            }
          );
        });

        $("#upload_ava").on("submit", (event) => {
          event.preventDefault();
          const form = document.querySelector("form#upload_ava");
          formData = new FormData(form);
          sendAjaxData(
            "/upload_ava",
            formData,
            (res) => {
              var result = JSON.parse(res.toString());
              if (result.success != true) {
                showMessage("Ошибка на сервере!", "danger");
              } else {
                showMessage("Картинка сохранена!", "success");
                $("#img__avatar").attr("src", result.url);
                $("#btn__upload_ava").attr("disabled", "disabled");
              }
            },
            () => {
              showMessage("Ошибка на сервере!", "danger");
            }
          );
        });
        feather.replace();
      },
      (res) => {
        showMessage("Ошибка на сервере!", "danger");
      }
    );
  });

  function readURL(e) {
    var file = $("#input__ava_upload").val();
    var reader = new FileReader();
    reader.onloadend = () => {
      $("#img__ava_preview").attr("src", reader.result);
      $("#btn__upload_ava").removeAttr("disabled");
    };
    reader.readAsDataURL(this.files[0]);
  }
}
