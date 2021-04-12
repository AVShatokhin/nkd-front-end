function check_role(req, role) {
  if (req.session.auth != true) {
    return false;
  } else {
    switch (req.session.role) {
      case "admin":
        return true;
      case "user":
        if ((role == "user") | (role == "")) {
          return true;
        } else {
          return false;
        }
      case "":
        if (role == "") return true;
        else return false;

      default:
        return false;
    }
  }
}

function signature(req) {
  return {
    uid: req.session.uid,
    email: req.session.email,
    ava: req.session.ava,
    name: req.session.name,
    surname: req.session.surname,
    second_name: req.session.second_name,
  };
}

async function addGearEvent(connection, op_time, active_gear, signature) {
  return new Promise((resolve) =>
    connection.query(
      "insert into gear_history set op_time=?, active_gear=?, signature=?;",
      [op_time, active_gear, JSON.stringify(signature)],
      (err, result) => {
        if (err != undefined) {
          console.log(err);
          resolve(false);
        }
        resolve(true);
      }
    )
  );
}

async function getGearHistory(connection) {
  return new Promise((resolve) =>
    connection.query(
      'select DATE_FORMAT(lts, "%d.%m.%Y %T") as date, lts, op_time, active_gear, signature from gear_history order by lts desc;',
      "",
      (err, result) => {
        if (err != undefined) {
          console.log(err);
          resolve(undefined);
        }
        resolve(result);
      }
    )
  );
}

module.exports.check_role = check_role;
module.exports.addGearEvent = addGearEvent;
module.exports.getGearHistory = getGearHistory;
module.exports.signature = signature;
