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
const spawn             = require("child_process").spawn;
const async             = require("async");
const path              = require("path");
const express           = require("express");
const fs                = require("node-fs");
const pr                = require("properties-reader");
const crypto            = require("crypto");
const querystring       = require("querystring");
const morgan            = require("morgan");
const cors              = require("cors");
const FileStreamRotator = require("file-stream-rotator");
const bodyP             = require("body-parser");

// Internal Modules.
const stage     = require("./lib/stage.js");
const Server    = require("./lib/server.js");
const Routes    = require("./lib/express.js");
const serverjar = require("./lib/serverjar.js");

// config for now.
let config = {
  minecraft: {
    name: null,
    ram: "512M",
    port: 25565,
    dir: "./minecraft",
    jar: "",
    version: ""
  },
  nodemc: {
    apikey: "3808e65d80bbe3fe373485c30f5dd830",
    version: "150",
    port: 3000,
    logDirectory: path.join(__dirname, "/nmc_logs")
  },
  firstrun: true
}

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

    stage.start(0, "preinit", "INIT");

    // Error Handler
    process.on("exit", () => { // When it exits kill the server process too
      if(server.spawn) server.spawn.kill(2);
    });

    if(server.spawn) {
      server.spawn.on("exit", () => {
        // to do re implement server restart defferel
      });
    }

    // Settup the logger
    fs.exists(logDirectory, exists => {
      if(!exists) {
        let err = mkdirp.sync(logDirectory);

        if(err) {
          return next("Log Directory Doesn\'t exist.");
        }
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
    app.use("/", express.static(sf_web));
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
    let routes = new Routes(stage, app, server, function() {
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

  if (serverOptions && !serverOptions.firstrun) {
    // Start then restart server for things to take effect
    //checkVersion();
    console.log("Starting server...");

    server.startServer();
    server.setport(config.minecraft.port);
    server.restartserver();

    console.log("Server running at localhost:" + PORT);
    console.log("API Key: " + apikey);
  }
  console.log("Navigate to http://localhost:" + config.nodemc.port + " to set up NodeMC.");
})

// Set variables for the server(s)
let dir = ".",
    files = "",
    completelog = "",
    srvprp;

// Server Variables.
let serverOptions,
    sf_web,
    outsideip;

// Server Configuration Variables / Defaults.
let PORT    = 3000,
    jardir,
    apikey,
    token,
    newOptions;

try { // If no error, server has been run before
  serverOptions = require("./frontend/properties.json");
} catch (e) { // If there is an error, copy server files!
    console.error(e);
    console.log("Essential files not found! Please read the guide on Getting Started :)");
    console.log("Exiting...");
    process.exit(1);
}

if (serverOptions.firstrun) {
  sf_web = "frontend/web_files/setup/";
} else {
  sf_web = "frontend/web_files/dashboard/";
}

if (serverOptions.apikey == "") {
  token = crypto.randomBytes(16).toString("hex");
  apikey = serverOptions.apikey = token;
  newOptions = JSON.stringify(serverOptions, null, 2);

  console.log("Generating new API key");

  fs.writeFile("server_files/properties.json", newOptions, function(err) {
    if (err) {
      return console.error("Something went wrong!");
    }
  });
} else {
  apikey = serverOptions.apikey;
}

app.get("/download/:file", function(request, response) {
    var options = {
        root: __dirname,
        dotfiles: "deny",
        headers: {
            "x-timestamp": Date.now(),
            "x-sent": true
        }
    };
    var file = querystring.unescape(request.params.file);
    if (!fs.lstatSync(file).isDirectory()) {
        fs.readFile("./" + file, {
            encoding: "utf-8"
        }, function(err, data) {
            if (!err) {
                response.download(file);
            } else {
                response.send("file not found");
            }

        });
    } else {
        fs.readdir(dir + "/" + file, function(err, items) {

        });
    }
});


app.delete("/deletefile", function(request, response) {
    if (checkAPIKey(request.body.apikey) == true) {
        var item = request.body.file;
        console.log(item);
        fs.unlink(item, function(err) {
            if (err) throw err;
            console.log(item + " deleted");
            response.send("true");
        });
    } else {
        response.send("false");
    }
});
