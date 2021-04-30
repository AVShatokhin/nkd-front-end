var parser = require("xml2json");
const fs = require("fs");

function getDefaultOptions() {
  let rawdata = fs.readFileSync(
    process.env.NKD_PATH + "./config/default_options.json"
  );
  let result = JSON.parse(rawdata);
  return result;
}

function openSignalsConfig() {
  return JSON.parse(
    fs.readFileSync(process.env.NKD_PATH + "./config/signals.json")
  );
}

function openRecordsConfig() {
  return JSON.parse(
    fs.readFileSync(process.env.NKD_PATH + "./config/records.json")
  );
}

async function openMainConfig(connection) {
  let object = JSON.parse(
    parser.toJson(fs.readFileSync(process.env.NKD_PATH + "./config/object.xml"))
  );
  object.signals = openSignalsConfig();
  object.records = openRecordsConfig();

  object.options = await getOptionsByLink(connection, [
    "active_gear_collection",
  ]);

  return object;
}

function openRollingFromXML() {
  let object = JSON.parse(
    parser.toJson(
      fs.readFileSync(process.env.NKD_PATH + "./config/rolling.xml")
    )
  );

  return object;
}

async function getOptionsByLink(connection, links) {
  return new Promise((resolve) => {
    let sqlWhere = [];
    let def = getDefaultOptions();

    links.forEach((link) => {
      if (def[link] != undefined) {
        // 1) будем запрашивать только те, которые указаны в конфиге
        sqlWhere.push(`link = "${link}"`);
      }
    });
    if (sqlWhere.length > 0) {
      connection.query(
        `select link, value from kvs where ${sqlWhere.join(" or ")} limit 1;`,
        [],
        (err, result) => {
          if (err != undefined) {
            console.log(err);
            resolve(undefined);
          }

          if (result != undefined) {
            // 2) если из базы вернулся результат
            let storedData = {};

            result.forEach((dataRow) => {
              // 3) формируем объект со значениями настроек из базы
              let link = dataRow.link;
              let collection = JSON.parse(dataRow.value);

              for (param in collection) {
                if (storedData[link] == undefined) storedData[link] = {};
                storedData[link][param] = collection[param];
              }
            });

            let collections = {};

            links.forEach((link) => {
              collections[link] = {};
              // 4) перебираем только те коллекции которые указаны в запросе
              // применяем настройки из базы только к тем параметрам, которые фигурируют в конфиге

              for (param in def[link]) {
                // 5) сначала записываем дефолтные значения из конфига
                collections[link][param] = def[link][param];

                if (def[link][param]["default"] != undefined) {
                  collections[link][param]["value"] =
                    def[link][param]["default"];
                }

                // 6) и если в базе есть значение для параметра, тогда вместо ддефолтного значения указываем значение параметра из базы
                if (storedData[link] != undefined) {
                  if (storedData[link][param] != undefined) {
                    collections[link][param]["value"] = storedData[link][param];
                  }
                }
              }
            });
            resolve(collections);
          } else {
            resolve(undefined);
          }
        }
      );
    } else {
      resolve(undefined);
    }
  });
}

async function setOptionsByLink(connection, req) {
  return new Promise((resolve) => {
    let link = req.body.link;
    let def = getDefaultOptions()[link];
    let newValues = {};
    if (def != undefined) {
      for (defaultOption in def) {
        if (req.body[defaultOption] != undefined) {
          // берем значения заданные пользователем
          newValues[defaultOption] = req.body[defaultOption];
        } else {
          // берем значения по умолчанию
          newValues[defaultOption] = def[defaultOption].default;
        }
      }
      connection.query(
        `replace kvs set link=?, value=?;`,
        [link, JSON.stringify(newValues)],
        (err, result) => {
          if (err != undefined) {
            console.log(err);
          }

          resolve(true);
        }
      );
    } else {
      resolve(false);
    }
  });
}

module.exports.openRollingFromXML = openRollingFromXML;
module.exports.getDefaultOptions = getDefaultOptions;
module.exports.getOptionsByLink = getOptionsByLink;
module.exports.setOptionsByLink = setOptionsByLink;
module.exports.openMainConfig = openMainConfig;
module.exports.openSignalsConfig = openSignalsConfig;
