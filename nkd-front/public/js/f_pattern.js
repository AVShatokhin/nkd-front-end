$(async function () {
  // ========= НИЖЕ инициализация основного приложения
  // Человек! Старайся, что бы в этом разделе были только:
  // * конструкторы объектов высокого уровня;
  // * инициализация объектов высокого уровня.
  console.log("1) get_config ... ");
  let __configsData = JSON.parse(await get_config("api/get_config"));
  let __configs = __configsData.data;
  sessionStorage.setItem("configs", JSON.stringify(__configs));

  console.log("2) main ... ");
  await get_end_point_async("/main");

  console.log("3) mnemo ... ");
  let mnemo = new mnemoSchema(__configs.mnemo_config, "div__mnemo");
  await mnemo.load();

  let monTableModel = new monitoringTableModel({ configs: __configs });
  let monTableView = new tableView({
    target: "div__monitoringTable",
    model: monTableModel,
  });

  monTableView.render();

  let treetable__currentResult_model = new dresult_model({
    configs: __configs,
    treetable: new treeListTableView("treetable__currentResult"),
    mnemo,
  });

  console.log("4) wsocket ... ");
  new WSClient({
    url: __configs.ws_url,
    models: {
      diagn: treetable__currentResult_model,
      monitoring: monTableModel,
    },
  });

  let menuOpts = gen_menu_options({
    model: treetable__currentResult_model,
    monTableView,
  });
  // ========= ВЫШЕ инициализация основного приложения

  // ========= НИЖЕ инициализация шаблона, здесь не трогай
  console.log("5) pattern ... ");
  new profile();
  new leftMenu(menuOpts);
  // ========= ВЫШЕ инициализация шаблона, здесь не трогай
});

// НИЖЕ располагай специфические для своего приложения функции
async function get_config(end_point) {
  return new Promise((resolve) => {
    sendAjaxGet(`${end_point}/`, (resHTML, resJSON) => {
      resolve(resJSON);
    });
  });
}

function gen_menu_options(options) {
  return [
    {
      id: "btn__show_main",
      active: true,
      end_point: "/main",
      callback: function () {
        options.model._treetable__currentResult.render();
        options.model._treetable__currentResult.plot();
        options.model._mnemo.plot();
        options.model.processMetaInfoDiagn();
        options.monTableView.render();
        options.monTableView.plot();
      },
    },
    {
      id: "btn__show_users",
      end_point: "/get_users",
      callback: function () {
        new usersPage();
      },
    },
    {
      id: "btn__show_control",
      end_point: "/get_control",
      callback: function () {
        initControl();
      },
    },
    {
      id: "btn__show_redchange",
      end_point: "/get_redchange",
    },
    {
      id: "btn__show_options",
      end_point: "/options/get_options",
      callback: function (resHTML, resJSON) {
        let ans = JSON.parse(resJSON);
        $("#dashboard_main_content").empty();
        $("#dashboard_main_content").html(resHTML);
        initOptions(ans.data.options);
      },
    },
    {
      id: "btn__show_monitoring",
      end_point: "/get_monitoring",
    },
    {
      id: "btn__show_statistics",
      end_point: "/get_diagn",
    },
  ];
}

// ВЫШЕ располагай специфические для своего приложения функции
