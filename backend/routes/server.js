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
  Router.post("/stopserver", (req, res) => { // Stop server
    if (!server.running) {
      server.execute("stop");
      server.running = true;
    }

    return res.sucess();
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
  Router.post("/execute", function(req, res) {
    const command = request.param("Body");
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
      response.success(buffer.join(""));
    }, 250);
  });

  return Router;
}
