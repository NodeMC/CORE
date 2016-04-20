/**
 * /firstrun
 *
 * @author Jared Allard <jaredallard@outlook.com>
 * @license MIT
 **/

"use strict";

const serverjar = require("../../lib/serverjar.js"),
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

    let details = {
      "apikey": server.config.nodemc.apikey,
      "port": parseInt(req.body.nmc_port, 10),
      "minecraft_port": parseInt(req.body.mc_port, 10),
      "ram": parseInt(req.body.memory, 10) + "M",
      "jarfile_directory": req.body.directory + "/", // Does not seem to matter if there is an extra "/"
      "jar": req.body.flavour,
      "version": req.body.version,
      "firstrun": false
    }

    let options = JSON.stringify(details, null, 2);
    if (details.version == "latest") {
      details.version = "1.9"; // Must keep this value manually updated /sigh
    }

    // to do: async this.
    let exists = fs.existsSync(details.jarfile_directory);
    if(!exists) {
      fs.mkdirSync(details.jarfile_directory, 777, true);
    }

    //Download server jarfile
    serverjar.getjar(details.jar, details.version, details.jarfile_directory, function(msg) {
      if (msg == "invalid_jar") {
        console.log("Unknown jarfile, manually install!");
      }
    });

    fs.writeFile("./frontend/properties.json", options, function(err) {
      if (err) {
        return console.log("Something went wrong!");
      }

      console.log("New admin settings saved.");
      console.log("You can use CTRL+C to stop the server.");
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
