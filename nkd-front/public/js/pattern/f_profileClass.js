class profile {
  // ===================== PUBLIC
  constructor() {
    this._initPasswordDialogs();
    this._initProfile();
  }

  _initPasswordDialogs() {
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
          if (result.status.success != true) {
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

  _initProfile() {
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
                if (result.status.success != true) {
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
              (resHTML, resJSON) => {
                // var result = JSON.parse(res.toString());
                let res = JSON.parse(resJSON);
                // console.log(res);
                if (res.status.success != true) {
                  showMessage("Ошибка на сервере!", "danger");
                } else {
                  $("#img__avatar").attr("src", res.data.url);
                  $("#img__ava_preview").attr("src", res.data.url);
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
            let formData = new FormData(form);
            sendAjaxData(
              "/upload_ava",
              formData,
              (res) => {
                var result = JSON.parse(res.toString());
                if (result.status.success != true) {
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
}
