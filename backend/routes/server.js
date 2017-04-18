/**
 * /server
 *
 * @author Jared Allard <jaredallard@outlook.com>
 * @license MIT
 **/

"use strict";

const authCheck = require("../../lib/auth.js")
const path      = require("path")
const fs        = require("fs")

module.exports = (Router, server) => {
  Router.use(authCheck(server));

  /**
   * POST /restart
   *
   * Restart the server.
   **/
  Router.post("/restart", (req, res) => { // Restart server
    server.restartServer();

    return res.success();
  });

  /**
   * POST /start
   *
   * Start the server.
   **/
  Router.post("/start", (req, res) => {
    if (server.running) {
      return res.error("already_running");
    }

    server.setport();
    server.startServer();

    return res.success();
  });

  /**
   * POST /stop
   *
   * Stop the server.
   **/
  Router.post("/stop", (req, res) => {
    if (!server.running) {
      return res.error("not_running");
    }

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

      return res.sendFile("minecraft.log", {
        root: server.log.route
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
    if(!props) {
      return res.error("internal", {
        moreinfo: "Failed to get props."
      });
    }

    let ver = server.config.minecraft.version,
        jar = server.config.minecraft.jar;

    let info = {
      motd: props.get("motd"),
      serverPort: props.get("server-port"),
      whiteList: props.get("white-list"),
      flavor: jar,
      flavour: jar,
      version: ver || null
    }

    res.success(info);
  });

  return Router;
}
