/**
 * /server
 *
 * @author Jared Allard <jaredallard@outlook.com>
 * @license MIT
 **/

"use strict";

const authCheck = require("../../lib/auth.js"),
      path      = require("path"),
      fs        = require("fs");

module.exports = (Router, server) => {
  Router.use(authCheck(server));

  /**
   * POST /restart
   *
   * Restart the server.
   **/
  Router.post("/restart", (req, res) => { // Restart server
    server.restartServer();

    return res.send();
  });

  /**
   * POST /start
   *
   * Start the server.
   **/
  Router.post("/start", (req, res) => {
    if (!server.running) {
      server.setport();
      server.startServer();
    }

    return res.succes();
  });

  /**
   * POST /stop
   *
   * Stop the server.
   **/
  Router.post("/stop", (req, res) => {
    server.stopServer("Stopping Server...", () => {});
    return res.success();
  });

  /**
   * GET /status
   *
   * Get the status of the server
   **/
  Router.get("/status", (req, res) => {
    let text = "down";

    if(server.running) {
      text = "up";
    }

    return res.success(text);
  });

  /**
   * POST /execute
   *
   * Execute a command on the server.
   **/
  Router.post("/execute", (req, res) => {
    const command = req.body.command;

    if (command === "stop") {
      server.running = false;
    } else if (command === "restart") {
      server.restartServer();
    }

    server.execute(command);

    return res.success(true);
  });

  /**
   * GET /log
   *
   * Get the server's log.
   **/
  Router.get("/log", (req, res) => {
    fs.exists(server.log.path, exists => {
      if(!exists) {
        res.status(501);
        return res.send();
      }

      return res.sendFile(server.log.path, {
        root: path.join(server.config.minecraft.dir, "../")
      });
    })
  });

  /**
   * GET /info
   *
   * Get server info.
   **/
  Router.get("/info", (req, res) => { // Return server info as JSON object
    const props = server.getServerProps();
    let serverInfo = [];
    if(!props) {
      return res.error("internal", {
        moreinfo: "Failed to get props."
      });
    }

    let ver = server.config.minecraft.ver,
        jar = server.config.minecraft.jar;

    serverInfo.push(props.get("motd")); // message of the day
    serverInfo.push(props.get("server-port")); // server port
    serverInfo.push(props.get("white-list")); // if whitelist is on or off
    serverInfo.push(jar + " " + ver);

    res.success(serverInfo);
  });

  return Router;
}
