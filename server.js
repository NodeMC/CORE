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
const async             = require("async");
const path              = require("path");
const express           = require("express");
const fs                = require("node-fs");
const morgan            = require("morgan");
const mkdirp            = require("mkdirp");
const cors              = require("cors");
const FileStreamRotator = require("file-stream-rotator");
const bodyP             = require("body-parser");
const semver            = require("semver");

// Internal Modules.
const stage     = require("./lib/stage.js");
const Server    = require("./lib/wrapper/server.js");
const Routes    = require("./lib/express.js");
const Update    = require("./lib/autoupdate.js");

// config for now.
let config;
try {
  config = require("./config/config.json");
} catch(e) {
  console.error("Failed to read config. This is OK on first run.")
  config = require("./config/config.example.js");
}

let updater = new Update();

updater.checkVersion(config.nodemc.version.core, isupdate => {
  if(!isupdate) return false;

  updater.updateGit(function(success){});
});

// instance the server
let app = new express();

// Instance the Server Object
let server = new Server(config)

async.waterfall([
  /**
   * Stage 0 - Pre-Init
   **/
  (next) => {
    let logger;
    let logDirectory = config.nodemc.logDirectory;

    stage.start(0, "preinit", "INIT");-

    // Settup the logger
    fs.exists(logDirectory, exists => {
      if(!exists) {
        mkdirp.sync(logDirectory);
      }

      let logFile = path.join(logDirectory + "/access-%DATE%.log");
      logger  = FileStreamRotator.getStream({
        filename: logFile,
        frequency: "daily",
        verbose: false,
        date_format: "YYYY-MM-DD"
      });

      stage.finished(0, "preinit", "INIT");
    });

    stage.on("finished", data => {
      if(data.stage === 0) {
        return next(false, logger);
      }
    })
  },

  /**
   * Stage 1 - Express Construction.
   **/
  (logger, next) => {
    stage.start(1, "express::construct", "INIT");

    // middleware
    app.use(cors());

    // static files
    if(config.firstrun) {
      app.use("/", express.static(config.dashboard.setup));
    } else {
      app.use("/", express.static(config.dashboard.dashboard));
      fs.readFile(path.join(config.dashboard.dashboard, "compat.txt"), (err, data) => {
        if (!semver.satisfies(config.nodemc.version.rest, data)) {
          console.log("The installed dashboard does not appear to support this version of NodeMC!");
          console.log("You may encounter issues with this dashboard - if so, please report this to the dashboard's developer.");
        }
      });
    }

    app.use(bodyP.json());
    app.use(bodyP.urlencoded({
        extended: false
    }));
    app.use(morgan("common", {
        stream: logger
    }));

    app.use((req, res, next) => {
      /**
       * Send A API conforment response
       *
       * @param {Anything} data  - data to send.
       *
       * @returns {Res#Send} express res.send
       **/
      res.success = (data) => {
        return res.send({
          success: true,
          data: data
        });
      }

      /**
       * Send A API conforment error.
       *
       * @param {String} message - error message
       * @param {Anything} data  - data to send.
       *
       * @returns {Res#Send} express res.send
       **/
      res.error = (message, data) => {
        return res.send({
          success: false,
          message: message,
          data: data
        })
      }

      return next();
    })

    // Build the Express Routes.
    let routes = new Routes(stage, app, server, config.nodemc.version.rest, function() {
      let args = Array.prototype.slice.call(arguments, 0);
      args[0]  = "main: "+stage.Sub+ " stage "+ stage.Stage + ": " + args[0];
      console.log.apply(console, args);
    });

    stage.on("finished", data => {
      if(data.stage === 1) {
        return next(false, routes);
      }
    })
  },

  /**
   * Stage 2 - Express Launch
   **/
   (routes, next) => {
     routes.start(config.nodemc.port);

     stage.on("finished", data => {
       if(data.stage === 2) {
         return next();
       }
     })
   }
], err => {
  if(err) {
    console.log("Failed to Start! :(")
    console.error(err);
    process.exit(1);
  }

  if (config && !config.firstrun) {
    let port   = config.minecraft.port,
        apikey = config.nodemc.apikey;

    // Start then restart server for things to take effect
    console.log("Starting server...");

    server.setport(port);
    server.startServer();

    console.log("Server running at localhost:" + port);
    console.log("API Key: " + apikey);

    return;
  }
  console.log("Navigate to http://localhost:" + config.nodemc.port + " to set up NodeMC.");
});

process.on("exit", () => {
  try {
    server.log.stream.close();
    console.log("Closed minecraft.log stream.");
    if(server.spawn) {
      // In Theory this is already done.... child_process cannot exists when parent closes.
      server.spawn.kill();
    }
  } catch(e) {
    console.error(e)
    console.error("Failed to close the Minecraft server log stream.")
  }
})
