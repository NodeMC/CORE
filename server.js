/**
 * NodeMC - Let's go to space!
 *
 * @author NodeMC Team <https://github.com/nodemc>
 * @version 6.0
 * @license MIT
 **/

"use strict";

// string hijack
require("colors")

// Requires
const path              = require("path");
const express           = require("express");
const mkdirp            = require("mkdirp");
const FileStreamRotator = require("file-stream-rotator");
const debug             = require("debug")("nodemc:server")

// Express JS Modules
const cors              = require("cors");
const morgan            = require("morgan");
const bodyP             = require("body-parser");
const normalize         = require("./lib/normalize.js");

// Internal Modules.
const Routes            = require("./lib/express.js");

// config for now.
const config      = require("./config/config.js")

console.log("By default NodeMC doesn't output to console.")
console.log("You can view it's inner debugging, with DEBUG='nodemc:<component>'")
console.log("or enable all debug output with DEBUG='nodemc:*'\n")

// async wrapper
const init = async () => {

  const dashboard    = config.dashboard;
  const logDirectory = config.nodemc.logDirectory;

  debug("config-patch", "fixing relative dirs")

  // Fix relative directories.
  const mDir = config.minecraft.dir;
  if(!path.isAbsolute(mDir)) {
    const relPath = path.join(__dirname, mDir);
    debug("config-patch", "evaluated path to be", relPath)
    config.minecraft.dir = relPath;

    mkdirp.sync(relPath);
  }

  // instance the server
  let app = new express();

  // Extra fs call, but doesn't require logic.
  mkdirp.sync(logDirectory);

  let logFile   = path.join(logDirectory, "/access-%DATE%.log");
  const logger  = FileStreamRotator.getStream({
    filename: logFile,
    frequency: "daily",
    verbose: false,
    date_format: "YYYY-MM-DD"
  });

  // static files
  if(config.firstrun) {
    app.use("/", express.static(dashboard.setup));
  } else {
    app.use("/", express.static(dashboard.dashboard));
  }

  app.use(cors());
  app.use(bodyP.json());
  app.use(bodyP.urlencoded({
    extended: false
  }));
  app.use(normalize);
  app.use(morgan("common", {
      stream: logger
  }));

  // Build the Express Routes.
  let routes = new Routes(app, {
    config: config
  }, config.nodemc.version.rest, require("debug")("nodemc:express"));

  console.log(`NodeMC started on :${config.nodemc.port}`)
  routes.start(config.nodemc.port);
}

init();

process.on("unhandledRejection", reason => {
  console.log("Unhandled Promise Rejection", reason)
});
