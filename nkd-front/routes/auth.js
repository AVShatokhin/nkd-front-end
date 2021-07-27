//const mysql = require("mysql");

var express = require("express");
var router = express.Router();

const nodemailer = require("nodemailer");
var crypto = require("crypto");
const redis = require("redis");
var api = require("../libs/nkd.js");

var conf = require("nconf")
  .argv()
  .env()
  .file({ file: process.env.NKD_PATH + "./config/config.json" });

router.get("/", function (req, res, next) {
  if (!api.check_role(req, "")) {
    res.redirect("/dashboard");
  } else {
    res.redirect("/auth");
  }
});

router.get("/auth", function (req, res, next) {
  res.render("security/auth");
});

router.get("/register", function (req, res, next) {
  res.render("security/register");
});

router.get("/reset_password", function (req, res, next) {
  res.render("security/reset_password");
});

router.get("/logout", function (req, res, next) {
  req.session.auth = false;
  res.redirect("/auth");
});

router.post("/login", function (req, res, next) {
  let sql_data = [req.body.email, req.body.password];

  let sql =
    "SELECT uid, email, ava, address, phone, name, second_name, surname, role from users where email = ? and pass_hash=md5(?);";
  let query = connection.query(sql, sql_data, (err, result) => {
    if (err) {
      req.session.auth = false;
      next(err);
    } else {
      if (result[0] != undefined) {
        req.session.uid = result[0].uid;
        req.session.ava = result[0].ava;
        req.session.address = result[0].address;
        req.session.phone = result[0].phone;
        req.session.name = result[0].name;
        req.session.second_name = result[0].second_name;
        req.session.surname = result[0].surname;
        req.session.role = result[0].role;
        req.session.email = result[0].email;
        req.session.auth = true;

        if (api.check_role(req, "")) {
          res.redirect("/dashboard");
        } else {
          req.session.auth = false;
          res.redirect("/auth");
        }
      } else {
        req.session.auth = false;
        res.redirect("/auth");
      }
    }
  });
});

router.post("/changepass", function (req, res, next) {
  let ans = { success: false };
  if (req.session.auth != true && req.session.came_by_link != true) {
    console.log("Not authed while changing password");
    res.json(ans);
  } else {
    req.session.came_by_link = false;
    let sql_data = [req.body.newPassword, req.session.uid];
    let query = connection.query(
      "UPDATE users set pass_hash = md5(?) where uid = ? limit 1;",
      sql_data,
      (err, result) => {
        if (err == undefined) ans.success = true;
        console.log("Password changed from user: " + req.session.email);
        if (req.session.email != undefined)
          sendPasswordChanged(req.session.email);
        res.json(ans);
      }
    );
  }
});

router.post("/email_verif_req", function (req, res, next) {
  // пришёл запрос на регистрацию нового пользователя
  let email = req.body.email;

  if (email == undefined) {
    res.redirect("/auth");
  } else {
    let query = connection.query(
      // проверим нет ли такого пользователя уже
      "SELECT uid from users where email = ?;",
      email,
      (sqlErr, sqlRes) => {
        if (sqlErr) {
          next(sqlErr);
        } else {
          if (sqlRes[0] == undefined) {
            // пользователя такого не оказалось
            let secret = Math.random();
            let hash = crypto
              .createHash("md5")
              .update(secret.toString())
              .digest("hex");

            redisClient.set("code:" + hash, email, (redisErr, redisRes) => {
              // добавим code в redis
              if (redisErr) console.log(redisErr);
              redisClient.expire("code:" + hash, 3600 * 24, () => {});
              if (redisRes == "OK") {
                // отправим письмо и создадим пользователя
                sendAuthMail(hash, email);
                let new_user = connection.query(
                  "insert into users set email=?, pass_hash=?, name=?, surname=?, second_name=?, phone=?, address=?;",
                  [
                    email,
                    hash,
                    "Имя",
                    "Фамилия",
                    "Отчество",
                    "+7",
                    "Не заполнено",
                  ],
                  (sql2Err, sql2Res) => {
                    // создали пользователя
                    if (sql2Err) {
                      console.log(sql2Err);
                      // next(sql2Err);
                    }
                  }
                );
              }
            });

            res.render("security/verif_send"); // сказали что ждём верификацию
          } else {
            res.render("security/user_allready_exists"); // оказалось что пользователь есть уже
          }
        }
      }
    );
  }
});

router.post("/password_reset_req", function (req, res, next) {
  // пришёл запрос на восстанлвление пароля
  let email = req.body.email;
  if (email == undefined) {
    res.redirect("/auth");
  } else {
    let query = connection.query(
      // проверим нет ли такого пользователя уже
      "SELECT uid from users where email = ?;",
      email,
      (sqlErr, sqlRes) => {
        if (sqlErr) {
          next(sqlErr);
        } else {
          if (sqlRes[0] != undefined) {
            // пользователь такой есть можно продолжать работать над этой задачей
            passwordRecoveryGenCodeAndSend(email);
            res.render("security/reset_send"); // сказали что ждём верификацию
          } else {
            res.render("security/user_notfound"); // оказалось что пользователь есть уже
          }
        }
      }
    );
  }
});

router.get("/email_confirm/:code", function (req, res, next) {
  req.session.auth = false;
  let code = req.params["code"];

  console.log(code);

  redisClient.get("code:" + code, (err, email) => {
    console.log("Установка пароля для пользователя: " + email);

    if (err) next(err);

    if (email == undefined) {
      res.redirect("/auth");
    } else {
      let query = connection.query(
        // достали UID пользователя, он будет нужен на следующем endpoint
        "SELECT uid from users where email = ?;",
        email,
        (sqlErr, sqlRes) => {
          if (sqlErr) {
            next(sqlErr);
          } else {
            if (sqlRes[0] != undefined) {
              req.session.came_by_link = true;
              req.session.uid = sqlRes[0].uid; // вот нашли и положили в сессию UID
              res.redirect("/set_password_dialog/");
            } else {
              res.redirect("/auth");
            }
          }
        }
      );
    }
  });
});

router.get("/set_password_dialog", function (req, res, next) {
  if (req.session.came_by_link == true) {
    res.render("security/set_password_dialog");
  } else {
    res.redirect("/auth");
  }
});

router.get("/profile", function (req, res, next) {
  res.render("security/profile", {
    avatar: req.session.ava,
    name: req.session.name,
    second_name: req.session.second_name,
    surname: req.session.surname,
    address: req.session.address,
    phone: req.session.phone,
  });
});

router.get("/reset_ava", function (req, res, next) {
  let ans = { success: false };
  if (req.session.auth != true) {
    res.json(ans);
  } else {
    var file_name = "noava.png";
    let sql_data = [file_name, req.session.uid];
    let query = connection.query(
      "UPDATE users set ava = ? where uid = ? limit 1;",
      sql_data,
      (err, result) => {
        if (err == undefined) ans.success = true;
        ans.url = "public/img/avatars/" + file_name;
        console.log("Ava deleted for user: " + req.session.email);
        res.json(ans);
      }
    );
  }
});

router.post("/upload_ava", function (req, res, next) {
  let ans = { success: false };
  if (req.session.auth != true) {
    res.json(ans);
  } else {
    var file_name = "ava_" + req.session.uid;

    if (req.files.new_ava.mimetype == "image/jpeg") {
      file_name += ".jpg";
    } else if (req.files.new_ava.mimetype == "image/png") {
      file_name += ".png";
    } else {
      console.log(
        "Error mimetype uploaded file for ava, user_id : " + req.session.email
      );
      res.json(ans);
      return;
    }

    req.files.new_ava.mv("public/img/avatars/" + file_name);
    ans.url = "public/img/avatars/" + file_name;

    let sql_data = [file_name, req.session.uid];
    let query = connection.query(
      "UPDATE users set ava = ? where uid = ? limit 1;",
      sql_data,
      (err, result) => {
        if (err == undefined) ans.success = true;
        console.log("Ava changed for user: " + req.session.email);
        res.json(ans);
      }
    );
  }
});

router.post("/change_user_data", function (req, res, next) {
  let ans = { success: false };
  if (req.session.auth != true) {
    console.log("Not authed while changing user data");
    res.json(ans);
  } else {
    let sql_data = [
      req.body.name,
      req.body.second_name,
      req.body.surname,
      req.body.address,
      req.body.phone,
      req.session.uid,
    ];

    let query = connection.query(
      "UPDATE users set name=?, second_name=?, surname=?, address=?, phone=? where uid = ? limit 1;",
      sql_data,
      (err, result) => {
        if (err == undefined) ans.success = true;
        console.log("Data changed from user: " + req.session.email);
        req.session.name = req.body.name;
        req.session.second_name = req.body.second_name;
        req.session.surname = req.body.surname;
        req.session.address = req.body.address;
        req.session.phone = req.body.phone;
        res.json(ans);
      }
    );
  }
});

router.get("/get_users", async function (req, res, next) {
  if (!api.check_role(req, "admin")) {
    res.render("security/noauthreq");
    return;
  }

  let users = await getUsers(connection);
  res.render("security/users", { users: users });
});

router.post("/change_role", async function (req, res, next) {
  let ans = { success: false };
  if (!api.check_role(req, "admin")) {
    console.log("Not permit while changing user role");
    res.json(ans);
  } else {
    let result = await updateUserRole(connection, req.body.role, req.body.uid);

    if (result.error == undefined) {
      ans.success = true;
      console.log(`Change role for user: ${req.body.uid} to ${req.body.role}`);
    }

    res.json(ans);
  }
});

router.post("/reset_pwd", async function (req, res, next) {
  // сброс пароля по запросу администратора через административный интерфейс
  let ans = { success: false };
  if (!api.check_role(req, "admin")) {
    console.log("Not permit while reset req for user");
    res.json(ans);
  } else {
    let result = await getUsers(connection, req.body.uid);

    if (result.error == undefined) {
      passwordRecoveryGenCodeAndSend(result[0].email);
      ans.success = true;
      console.log(`Reset pwd request by admin for user: ${result[0].email}`);
    }

    res.json(ans);
  }
});

router.post("/delete_user", async function (req, res, next) {
  // сброс пароля по запросу администратора через административный интерфейс
  let ans = { success: false };
  if (!api.check_role(req, "admin")) {
    console.log("Not permit while reset req for user");
    res.json(ans);
  } else {
    let result = await deleteUser(connection, req.body.uid);

    if (result.error == undefined) {
      ans.success = true;
      console.log(`User deleted: ${req.body.uid}`);
    }

    res.json(ans);
  }
});

router.post("/spam", async function (req, res, next) {
  // сброс пароля по запросу администратора через административный интерфейс
  let ans = { success: false };
  if (!api.check_role(req, "admin")) {
    console.log("Not permit while spam on|off for user");
    res.json(ans);
  } else {
    let result = await spamUser(connection, req.body.uid, req.body.spam);

    if (result.error == undefined) {
      ans.success = true;
      console.log(`Spam ${req.body.spam} for user ${req.body.uid} `);
    }

    res.json(ans);
  }
});

async function spamUser(connection, uid, spam) {
  return new Promise((resolve) =>
    connection.query(
      `UPDATE users set spam=? where uid=? limit 1;`,
      [spam, uid],
      (err, result) => {
        if (err != undefined) {
          resolve({ error: err });
        } else {
          resolve(result);
        }
      }
    )
  );
}

async function sendAuthMail(hash, email) {
  let result = await transporter.sendMail({
    from: `"Система контроля доступа" <${conf.get("smtp_user")}>`,
    to: email,
    subject: `GTLab.Диагностика: подтверждение электронного ящика [${hash}]`,
    html:
      "Система контроля доступа GTLab.Диагностика привествует Вас!<br>" +
      "<b>Для завершения регистрации перейдите по ссылке:</b> " +
      `<a href="http://${conf.get(
        "base_url"
      )}/email_confirm/${hash}">подтверждение почтового ящика</a>`,
  });
  // console.log(result);
}

async function sendPasswordRecoveryMail(hash, email) {
  let result = await transporter.sendMail({
    from: `"Система контроля доступа" <${conf.get("smtp_user")}>`,
    to: email,
    subject: `GTLab.Диагностика: восстановление пароля [${hash}]`,
    html:
      "Система контроля доступа GTLab.Диагностика привествует Вас!<br>" +
      "<b>Для восстановления пароля пройдите по ссылке:</b>" +
      ` <a href="http://${conf.get(
        "base_url"
      )}/email_confirm/${hash}">восстановление пароля</a>`,
  });
}

async function sendPasswordChanged(email) {
  let result = await transporter.sendMail({
    from: `"Система контроля доступа" <${conf.get("smtp_user")}>`,
    to: email,
    subject: `GTLab.Диагностика: пароль изменён [${Math.random()}]`,
    html:
      "Система контроля доступа GTLab.Диагностика привествует Вас!<br>" +
      "<b>Обращаю ваше внимание на то, что пароль к вашей учетной записи был изменён.</b>",
  });
}

function passwordRecoveryGenCodeAndSend(email) {
  let secret = Math.random();
  let hash = crypto.createHash("md5").update(secret.toString()).digest("hex");
  redisClient.set("code:" + hash, email, (redisErr, redisRes) => {
    // добавим code в redis
    if (redisErr) console.log(redisErr);
    redisClient.expire("code", 3600 * 24, () => {});
    // отправим письмо
    if (redisRes == "OK") sendPasswordRecoveryMail(hash, email);
  });
}

let transporter = nodemailer.createTransport({
  host: conf.get("smtp_server"),
  port: 465,
  secure: true,
  auth: {
    user: conf.get("smtp_user"),
    pass: conf.get("smtp_pass"),
  },
});

var redisClient = redis.createClient({
  host: conf.get("redis_host"),
  port: conf.get("redis_port"),
  password: conf.get("redis_password"),
});

redisClient.on("error", function (err) {
  console.log("Error " + err);
});

redisClient.on("connect", function (err) {
  console.log("redis connected");
});

var connection;

function setConnection(con) {
  connection = con;
}

async function getUsers(connection, uid) {
  let request = `select uid, name, second_name, surname, ava, phone, address, email, role, spam from users order by uid`;
  let param = [];

  if (uid != undefined) {
    // если мы достаем одного пользователя по UID
    request = `select uid, name, second_name, surname, ava, phone, address, email, role, spam from users where uid=?`;
    param = [uid];
  }

  return new Promise((resolve) =>
    connection.query(request, param, (err, result) => {
      if (err != undefined) {
        console.log(err);
        resolve({ error: err });
      } else {
        resolve(result);
      }
    })
  );
}

async function updateUserRole(connection, role, uid) {
  return new Promise((resolve) =>
    connection.query(
      `UPDATE users set role=? where uid=? limit 1;`,
      [role, uid],
      (err, result) => {
        if (err != undefined) {
          resolve({ error: err });
        } else {
          resolve(result);
        }
      }
    )
  );
}

async function deleteUser(connection, uid) {
  return new Promise((resolve) =>
    connection.query(
      `DELETE from users where uid=? limit 1;`,
      [uid],
      (err, result) => {
        if (err != undefined) {
          resolve({ error: err });
        } else {
          resolve(result);
        }
      }
    )
  );
}

module.exports = router;
module.exports.setConnection = setConnection;
