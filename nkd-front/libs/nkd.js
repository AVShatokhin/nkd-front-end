async function getSnSorted(connection, mids) {
  let sqlWhere = [];

  mids.forEach((mid) => {
    sqlWhere.push(`mid = ${mid}`);
  });

  let main;

  return new Promise((resolve) =>
    connection.query(
      `select sn, alias, mid from mso_align where ${sqlWhere.join(
        " or "
      )} order by alias;`,
      "",
      (err, result) => {
        let sns = [];

        result.forEach((item) => {
          sns.push(item.sn);
        });

        result.sns = sns;

        resolve(result);
      }
    )
  );
}

async function setConfig_Timers(connection, sns) {
  return new Promise((resolve) => {
    resolve("ok");
  });
}

async function getCostsBySN(connection, sns) {
  let sqlWhere = [];

  sns.forEach((sn) => {
    sqlWhere.push(`sn = ${sn}`);
  });

  let main;

  return new Promise((resolve) =>
    connection.query(
      `select * from mso_cost2 where ${sqlWhere.join(" or ")} order by sn;`,
      "",
      (err, result) => {
        resolve(result);
      }
    )
  );
}

async function getConfigBySN(connection, sns) {
  let sqlWhere = [];

  sns.forEach((sn) => {
    sqlWhere.push(`sn = "${sn}"`);
  });

  let main;

  return new Promise((resolve) =>
    connection.query(
      `select * from mso_config2 where ${sqlWhere.join(" or ")} order by sn;`,
      "",
      (err, result) => {
        let configs = new Map();

        result.forEach((item) => {
          configs.set(item.sn, item);
        });

        resolve(configs);
      }
    )
  );
}

module.exports.getSnSorted = getSnSorted;
module.exports.getConfigBySN = getConfigBySN;
module.exports.setConfig_Timers = setConfig_Timers;
