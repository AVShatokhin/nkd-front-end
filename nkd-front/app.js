var createError = require("http-errors");
var express = require("express");
var path = require("path");
var logger = require("morgan");
const session = require("express-session");
const redisStorage = require("connect-redis")(session);
const redis = require("redis");
const client = redis.createClient();
var authRouter = require("./routes/auth");
var dashboardRouter = require("./routes/dashboard");
var debugRouter = require("./routes/debug");
var configsRouter = require("./routes/actions/configs");

var favicon = require("serve-favicon");
var fileUpload = require("express-fileupload");

const { allowedNodeEnvironmentFlags } = require("process");

var app = express();

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
  app.use("/actions", configsRouter);

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

module.exports = app;
module.exports.init = init;
