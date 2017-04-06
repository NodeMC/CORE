/**
 * This is the sourcecode for the NodeMC control
 * panel software - it is a web server that runs on a specific
 * port.
 *
 * If you have any questions feel free to ask either on Github or
 * email: gabriel@nodemc.space!
 *
 * (c) Gabriel Simmer 2016
 *
 * Todo:
 * md5sum check for jarfiles
 * File uploading from HTML5 dashboard
 * Self-updater (possible?)
 * Support for other flavours of Minecraft server
 * General dashboard overhaul for sleeker appearence
 *     - Server stats
 *     - Other info on index.html
 *
 * @author Gabriel Simmer <gabreil@nodemc.space>
 * @version 1.0.0
 * @license GPL3
 **/

"use strict";

// Requires
const path              = require("path");
const express           = require("express");
const fs                = require("fs-promise");
const mkdirp            = require("mkdirp");
const FileStreamRotator = require("file-stream-rotator");
const semver            = require("semver");

// Express JS Modules
const cors              = require("cors");
const morgan            = require("morgan");
const bodyP             = require("body-parser");
const normalize         = require("./lib/normalize.js");

// Internal Modules.
const stage     = require("./lib/stage.js");
const Server    = require("./lib/wrapper/server.js");
const Routes    = require("./lib/express.js");
const Update    = require("./lib/autoupdate.js");

// config for now.
const config      = require("./config/config.js")

// async wrapper
const init = async () => {

  const dashboard    = config.dashboard;
  const logDirectory = config.nodemc.logDirectory;

  // instance the server
  let app = new express();
  let server = new Server(config)
  let updater = new Update();

  // Check NodeMC version.
  updater.checkVersion(config.nodemc.version.core);

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

  // Check dashboard version
  const data = await fs.readFile(path.join(dashboard.dashboard, "compat.txt"));
  if(!semver.satisfies(config.nodemc.version.rest, data)) {
    console.log("The installed dashboard does not appear to support this version of NodeMC!");
    console.log("You may encounter issues with this dashboard - if so, please report this to the dashboard's developer.");
  }

  app.use(cors());
  app.use(bodyP.json());
  app.use(bodyP.urlencoded());
  app.use(normalize);
  app.use(morgan("common", {
      stream: logger
  }));

  // Build the Express Routes.
  let routes = new Routes(stage, app, server, config.nodemc.version.rest, require("debug")("nodemc:express"));

  routes.start(config.nodemc.port);
}

init();
