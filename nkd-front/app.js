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
const client = redis.createClient();
const engineRouter = require("./engine/engine");
const authRouter = require("./routes/auth");
const dashboardRouter = require("./routes/dashboard");
const optionsRouter = require("./routes/options");
const debugRouter = require("./routes/debug");
const { allowedNodeEnvironmentFlags } = require("process");
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

  const sessionOpts = {
    store: new redisStorage({
      host: conf.get("redis_host"),
      port: conf.get("redis_port"),
      client: client,
    }),
    secret: conf.get("redis_secret"),
    saveUninitialized: true,
  };

  app.use(session(sessionOpts));
  app.use("/theme", express.static(path.join(__dirname, "/theme")));
  app.use("/public", express.static(path.join(__dirname, "/public")));

  app.use(authRouter);
  app.use("/dashboard", dashboardRouter);
  app.use("/debug", debugRouter);
  app.use("/options", optionsRouter);
  app.use("/api", engineRouter);

  app.use(function (req, res, next) {
    next(createError(404));
  });

  app.use(function (err, req, res, next) {
    res.locals.message = err.message;
    res.locals.error = req.app.get("env") === "development" ? err : {};
    res.status(err.status || 500);
    res.render("error");
  });
}

var conf = require("nconf").argv().env().file({ file: "./config/config.json" });

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
      authRouter.setConnection(connection);
      dashboardRouter.setConnection(connection);
      optionsRouter.setConnection(connection);
      engineRouter.setConnection(connection);
    }
  });
});

optionsRouter.on("active_gear", (data) => {
  engineRouter.updateActiveGear(data);
});

module.exports = app;
module.exports.init = init;
