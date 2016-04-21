/**
 * /server
 *
 * @author Jared Allard <jaredallard@outlook.com>
 * @license MIT
 **/

"use strict";

const authCheck = require("../../lib/auth.js");

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
    const command = req.param("command");
    if (command == "stop") {
      server.running = false;
    } else if (command == "restart") {
      server.restartServer();
    }

    server.execute(command);

    let buffer = [];
    let collector = function(data) {
      data = data.toString();
      buffer.push(data.split("]: ")[1]);
    };

    server.spawn.stdout.on("data", collector);

    setTimeout(function() {
      server.spawn.stdout.removeListener("data", collector);
      res.success(buffer.join(""));
    }, 250);
  });

  /**
   * GET /log
   *
   * @todo IMPLEMENT ASAP. needs access to the log object. consume the stream?
   *
   * Get the server's log.
   **/
  Router.get("/log", (req, res) => {
    return res.error("not_implemented", {
      moreinfo: "Bug @jaredallard to stop being lazy and finish this."
    });
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
