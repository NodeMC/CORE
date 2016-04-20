/**
 * /firstrun
 *
 * @author Jared Allard <jaredallard@outlook.com>
 * @license MIT
 **/

"use strict";

const serverjar = require("../../lib/serverjar.js"),
      mkdirp    = require("mkdirp"),
      async     = require("async"),
      fs        = require("fs");

module.exports = (Router, server) => {
  let config = server.config;

  // First run setup POST
  Router.post("/setup", function(req, res) {
    let apikey   = config.nodemc.apikey,
        firstrun = config.firstrun;

    if(!firstrun) {
      return res.error("is_not_first_run", {
        moreinfo: "The server has been run before!"
      });
    }

    let details;
    async.waterfall([
      /**
       * Parse the config.
       **/
      (next) => {
        details = {
          minecraft: {
            name: null,
            port: parseInt(req.body.mc_port, 10),
            ram: parseInt(req.body.memory, 10) + "M",
            dir: req.body.directory + "/",
            jar: req.body.flavour,
            version: req.body.version
          },
          nodemc: {
            apikey: apikey,
            port: parseInt(req.body.nmc_port, 10)
          },
          firstrun: false
        }

        if (details.minecraft.version == "latest") {
          details.minecraft.version = "1.9";
        }

        return next();
      },

      /**
       * Check and make sure the jar file directory exists
       **/
      (next) => {
        fs.exists(details.jarfile_directory, exists => {
            if(!exists) {
              return mkdirp(details.jarfile_directory, next);
            }

            return next();
        });
      },

      /**
       * Fetch the jar.
       **/
      (next) => {
        serverjar.getjar(details.jar, details.version, details.jarfile_directory, function(msg) {
          if (msg == "invalid_jar") {
            return next("Failed to obtain jar file.")
          }

          return next();
        });
      },

      /**
       * Save the Configuration
       **/
      (next) => {
        details = JSON.stringify(details);
        fs.writeFile("./frontend/properties.json", details, function(err) {
          if (err) {
            return next(err);
          }

          return next();
        });
      }
    ], err => {
      if(err) {
        return res.error("internal", {
          debuginfo: err
        });
      }

      console.log("New admin settings saved.");
      console.log("You can use CTRL+C to stop the server.");
      return res.send({});
    });
  });

  Router.get("/apikey", function(req, res) {
    let apikey   = config.nodemc.apikey,
        firstrun = config.firstrun;

    if (firstrun) {
      return res.send(apikey);
    }

    return res.error("is_not_first_run", {
      moreinfo: "The server has been run before!"
    });
  });

  return Router;
};
