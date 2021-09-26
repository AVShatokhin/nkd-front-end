// const { allowedNodeEnvironmentFlags } = require("process");
const createError = require("http-errors");
const express = require("express");
const path = require("path");
const logger = require("morgan");
const favicon = require("serve-favicon");
const fileUpload = require("express-fileupload");
const mysql = require("mysql");
const session = require("express-session");
const redisStorage = require("connect-redis")(session);
const redis = require("redis");

const profileRouter = require("./routes/pattern/profile");
const patternRouter = require("./routes/pattern");

// НИЖЕ объявление специфичных для приложения роутеров
const engineRouter = require("./engine/engine");
const optionsRouter = require("./routes/options");
const debugRouter = require("./routes/debug");
const monitoringRouter = require("./routes/statistics/monitoring");
const diagnRouter = require("./routes/statistics/diagn");
const redchangeRouter = require("./routes/statistics/redchange");
const controlRouter = require("./routes/control");
const mnemoRouter = require("./routes/mnemo");
const mainRouter = require("./routes/main");
// ВЫШЕ объявление специфичных для приложения роутеров

const app = express();

function init(conf) {
  app.set("port", conf.get("local_port"));

  app.set("views", path.join(__dirname, "views"));
  app.set("view engine", "ejs");

  app.use(fileUpload({ safeFileNames: true }));
  app.use(logger("dev"));
  app.use(express.json());
  app.use(express.urlencoded({ extended: false }));
  app.use(favicon(path.join(__dirname, "public/img", "favicon.ico")));

  const client = redis.createClient({
    host: conf.get("redis_host"),
    port: conf.get("redis_port"),
    password: conf.get("redis_password"),
  });

  const sessionOpts = {
    store: new redisStorage({
      client: client,
      ttl: 86400 * 30,
    }),
    secret: conf.get("redis_secret"),
    saveUninitialized: true,
  };

  app.use(session(sessionOpts));
  app.use("/theme", express.static(path.join(__dirname, "/theme")));
  app.use("/public", express.static(path.join(__dirname, "/public")));

  app.use(profileRouter);
  app.use("/dashboard", patternRouter);
  app.use("/debug", debugRouter);

  // ниже роутеры основного приложения
  app.use("/options", optionsRouter);
  app.use("/api", engineRouter);
  app.use("/get_monitoring", monitoringRouter);
  app.use("/get_diagn", diagnRouter);
  app.use("/get_redchange", redchangeRouter);
  app.use("/get_control", controlRouter);
  app.use("/mnemo", mnemoRouter);
  app.use("/main", mainRouter);

  app.use(function (req, res, next) {
    next(createError(404));
  });

  app.use(function (err, req, res, next) {
    res.locals.message = err.message;
    res.locals.error = req.app.get("env") === "development" ? err : {};
    res.status(err.status || 500);
    res.render("error");
  });

  const connection = mysql.createConnection({
    host: conf.get("db_host"),
    user: conf.get("db_user"),
    database: conf.get("db_name"),
    password: conf.get("db_password"),
  });

  connection.connect((err) => {
    if (err) {
      console.log(err);
      throw err;
    }

    connection.query("SET time_zone='+3:00';", function (err, result) {
      if (err) {
        throw err;
      } else {
        console.log("mysql connected");
        profileRouter.setConnection(connection);
        // patternRouter.setConnection(connection);

        // ниже настройка роутеров основного приложения на работу с СУБД
        optionsRouter.setConnection(connection);
        engineRouter.setConnection(connection);
        redchangeRouter.setConnection(connection);
        diagnRouter.setConnection(connection);
      }
    });
  });

  // НИЖЕ специфические для приложения настройки
  optionsRouter.on("active_gear", (data) => {
    engineRouter.updateActiveGear(data);
  });

  optionsRouter.on("optionsChanged", () => {
    engineRouter.optionsChanged();
  });

  optionsRouter.setCurrent(engineRouter.getCurrent());

  controlRouter.on("cmd", (cmd, params) => {
    engineRouter.cmd(cmd, params);
  });

  monitoringRouter.setConfig(conf);
  engineRouter.setConfig(conf);
}
// ВЫШЕ специфические для приложения настройки

module.exports = app;
module.exports.init = init;
