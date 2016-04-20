/**
 * /server
 *
 * @author Jared Allard <jaredallard@outlook.com>
 * @license MIT
 **/

"use strict";

module.exports = (Router, server) => {
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

    return res.send();
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

    return res.send();
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

    return res.send(text);
  });

  return Router;
}
