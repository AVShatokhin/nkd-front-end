let current = { loading: true };

function updateData(link, data, dontsave) {
  current[link] = data;
  if (dontsave != true) updateCurrentBackUP(link);
}

async function updateCurrentBackUP(link) {
  return new Promise((resolve) => {
    connection.query(
      "update kvs set value=?, lts=now() where link=?;",
      [JSON.stringify(current[link]), link],
      (err, result) => {
        if (err != undefined) {
          console.log(err);
          resolve(false);
        }
        // console.log(result);
        if (result.affectedRows == 0) {
          // update не сработал, надо делать insert
          connection.query(
            "insert into kvs set value=?, link=?",
            [JSON.stringify(current[link]), link],
            (err, result) => {
              if (err != undefined) {
                console.log(err);
                resolve(false);
              }
              // console.log(result);
              resolve(true);
            }
          );
        }
        resolve(true);
      }
    );
  });
}

async function loadCurrentFromBackUP(list) {
  let sqlWhere = [];
  list.forEach((link) => {
    sqlWhere.push(`link = "${link}"`);
  });
  return await new Promise((resolve) => {
    connection.query(
      `select link, value from kvs where ${sqlWhere.join(" or ")};`,
      [],
      (err, result) => {
        if (err != undefined) {
          console.log(err);
          resolve(undefined); // ошибка при работе с базой
        } else {
          //console.log(result);
          if (result.length != 0) {
            let r = {};
            result.forEach((element) => {
              r[element.link] = JSON.parse(element.value);
            });
            // console.log(r);
            resolve(r); // получили результат из базы
          } else {
            resolve(undefined); // не нашлось ничего в базе
          }
        }
      }
    );
  });
}

function getAllData() {
  return current;
}

function getDataByLink(link) {
  if (link in current) return current[link];
}

let connection;

async function setConnection(con) {
  connection = con;
  current = await loadCurrentFromBackUP([
    "signals",
    "active_gear_collection",
    "badges",
    "moto",
    "diagn",
    "options_changed_ts",
    "cmd",
  ]);
  // console.log(current);
}

function getActiveGear() {
  if ("active_gear_collection" in current) {
    if ("active_gear" in current.active_gear_collection) {
      return current.active_gear_collection.active_gear;
    }
  }
}

function updateMoto(active_gear, new_moto) {
  if (active_gear == 0) {
    current.moto.moto_0 = +new_moto;
  } else if (active_gear == 1) {
    current.moto.moto_1 = +new_moto;
  } else {
    console.log("ERROR: updateMoto: active_gear = " + active_gear);
    return;
  }

  updateCurrentBackUP("moto");
}

function getMoto(active_gear) {
  let moto = getDataByLink("moto");
  if (moto === undefined) return;

  if (active_gear == 0) return moto.moto_0;
  else if (active_gear == 1) return moto.moto_1;
}

function optionsChanged() {
  updateData("options_changed_ts", new Date().getTime());
}

function setCMD(opts) {
  // console.log(opts);

  if (current?.cmd == null) {
    current["cmd"] = {};
  }

  if (current.cmd?.[`${opts?.cmd}`] == null) {
    current.cmd[`${opts?.cmd}`] = { state: "", params: "" };
  }

  current.cmd[`${opts.cmd}`]["state"] = opts?.state;
  current.cmd[`${opts.cmd}`]["params"] = opts?.params;

  updateCurrentBackUP("cmd");
}

module.exports.setConnection = setConnection;
module.exports.updateData = updateData;
module.exports.updateMoto = updateMoto;
module.exports.optionsChanged = optionsChanged;
module.exports.setCMD = setCMD;
module.exports.getMoto = getMoto;
module.exports.getActiveGear = getActiveGear;
module.exports.getAllData = getAllData;
module.exports.getDataByLink = getDataByLink;
