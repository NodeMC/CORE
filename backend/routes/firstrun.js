/**
 * /firstrun
 *
 * @author Jared Allard <jaredallard@outlook.com>
 * @license MIT
 **/

"use strict";

const serverjar = require("../../lib/wrapper/serverjar.js")
const uuid      = require("uuid")
const mkdirp    = require("mkdirp")
const async     = require("async")
const fs        = require("fs")

// string coloration.
require("colors")

module.exports = (Router, server) => {
  let config = server.config;

  // Check if firstrun or not.
  Router.use((req, res, next) => {
    const firstrun = config.firstrun;

    if(firstrun) return next();

    return res.error("is_not_first_run", "The server has been run before!");
  })

  // First run setup POST
  Router.post("/setup", (req, res) => {
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
            dir: `${req.body.directory}/`,
            jar: req.body.flavour || "vanilla",
            version: req.body.version || "latest"
          },
          nodemc: {
            version: config.nodemc.version,
            port: parseInt(req.body.nmc_port, 10),
            logDirectory: "./nodemc/logs"
          },
          dashboard: require("../../config/config.example.js").dashboard,
          firstrun: false
        }

        return next();
      },

      /**
       * Check and make sure the jar file directory exists
       **/
      (next) => {
        fs.exists(details.minecraft.dir, exists => {
          if(!exists) return mkdirp(details.minecraft.dir, next);


          return next();
        });
      },

      /**
       * Fetch the jar.
       **/
      (next) => {
        const dir = details.minecraft.dir,
              jar = details.minecraft.jar,
              ver = details.minecraft.version;

        // Download a server jar.
        serverjar(jar, ver, dir)
          .then(() => {
            details.minecraft.jarfile = `${jar}.${ver}.jar`;
            return next();
          })
          .catch(err => {
            return next(err);
          })
      },

      /**
       * Save the Configuration
       **/
      (next) => {
        const stringified = JSON.stringify(details, null, 2);
        details = `module.exports = ${stringified}`;

        fs.writeFile("./config/config.js", details, next);
      }
    ], err => {
      if(err) {
        console.log("ERROR:", err)
        return res.error("internal", {
          debuginfo: err
        });
      }

      console.log("New admin settings saved.".green);
      console.log("You can use CTRL+C to stop the server.".cyan);
      return res.send({});
    });
  });

  Router.get("/apikey", (req, res) => {
    let apikey     = config.nodemc.apikey

    // Generate an APIKey
    if(!apikey || apikey === "") {
      config.nodemc.apikey = apikey = uuid.v4()
    }

    return res.send(apikey);
  });

  return Router;
};
