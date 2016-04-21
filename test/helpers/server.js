"use strict";

const spawn = require("child_process").spawn,
      path  = require("path");

let self  = null;

module.exports = class Server {
  constructor() {
    this.base   = path.join(__dirname, "../..");
    this.server = path.join(this.base, "server.js");
    this.proc   = null;

    self = this;
  }

  /**
   * Stop the Server.
   *
   * @param {Function} next - callback
   * @returns {undefined} use callback.
   **/
  stop(next) {
    if(!self.proc) {
      new Error("Tried to Restart When Not Running")
      return next();
    }

    this.proc.on("exit", function() {
      // console.log("SERVER: killed.")
      return next();
    });

    this.proc.kill("SIGKILL");

    // console.log("SERVER: Attempted to kill.")
  }

  /**
   * Restart the Server.
   *
   * @param {Function} next - callback
   * @returns {undefined} use callback.
   **/
  restart(next) {
    self.stop(() => {
      self.start(next);
    })
  }

  /**
   * Start the Server.
   *
   * @param {Function} next - callback
   * @returns {undefined} use callback.
   **/
  start(next) {
    this.proc = spawn("node", [this.server], {
      cwd: self.base
    });

    // console.log("SERVER: Started.")

    // this.proc.stdout.pipe(process.stdout);
    this.proc.stderr.pipe(process.stderr);

    setTimeout(() => {
      return next();
    }, 1500)
  }
}
