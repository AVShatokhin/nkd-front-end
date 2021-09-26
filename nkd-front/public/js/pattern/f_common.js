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

function sendAjaxGet(url, success_function, error_function) {
  $.ajax({
    url: url, //url страницы
    method: "GET", //метод отправки
    dataType: "html", //формат данных
    success: (income) => {
      let __income = JSON.parse(income);
      if (__income.status.auth != true) {
        location.reload();
      } else {
        success_function(__income.data.html, income);
      }
    },
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

function get_end_point(end_point, callback) {
  sendAjaxGet(
    `${end_point}/`,
    (resHTML, resJSON) => {
      $("#dashboard_main_content").empty();
      $("#dashboard_main_content").html(resHTML);
      // если загрузка энд-поинта завершилась удачно, то тогда
      if (callback != undefined) {
        callback(resHTML, resJSON);
      }
    },
    () => {
      showMessage("Ошибка загрузки приложения!", "danger");
    }
  );
}

async function get_end_point_async(end_point) {
  return new Promise((resolve) => {
    sendAjaxGet(
      `${end_point}/`,
      (resHTML, resJSON) => {
        $("#dashboard_main_content").empty();
        $("#dashboard_main_content").html(resHTML);
        // если загрузка энд-поинта завершилась удачно, то тогда
        resolve({ resHTML, resJSON });
      },
      () => {
        showMessage("Ошибка загрузки приложения!", "danger");
      }
    );
  });
}
