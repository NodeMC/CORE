/**
 * Server Module.
 *
 * @author Jared Allard <jaredallard@outlook.com>
 * @license GPL3
 **/

"use strict";

const async   = require("async"),
      getfile = require("request"),
      spawn   = require("child_process").spawn,
      pr      = require("properties-reader"),
      fs      = require("fs");

module.exports = class Server {
  constructor(config) {
    this.running = false;
    this.nodemc  = {
      version: config.nodemc.version
    };
    this.version = null;
    this.config  = config;
  }

  startServer() {
    let config = this.config;

    this.running = false;
    this.spawn = spawn("java", [
        "-Xmx" + config.ram,
        "-Xms" + config.ram,
        "-jar",
        config.jarfile,
        "nogui"
    ]);
    serverSpawnProcess.stdout.on("data", log);
    serverSpawnProcess.stderr.on("data", log);
    serverSpawnProcess.on("exit", function(code) {
        serverStopped == true; // Server process has crashed or stopped
        if (restartPending) {
            startServer();
        }
    });
  }

  /**
   * Restart The server
   *
   * @returns {Promise} when restart finishes / fails
   */
  restartServer() {
    let deffered = () => {
      let port = this.port;
      this.setport(port);
      this.startServer();
    };

    if (!this.running) {
      this.execute("say [NodeMC] Restarting server!");
      this.execute("stop");
      this.spawn.on("close", deffered);
    } else {
      return deffered();
    }
  }

  /**
   * Check the version of NodeMC.
   *
   * @todo implement promise
   *
   * @returns {Promise} with true/false if up to date on .then()
   **/
  checkVersion() {
    let current = this.nodemc.version;
    getfile.get("https://raw.githubusercontent.com/NodeMC/NodeMC-CORE/master/version.txt", (error, res, body) => {
      if (!error && res.statusCode == 200) {
        let version = body;
        if (version != current) {
          let behind = version - current;
          console.log("NodeMC is " + behind + " versions behind. Run a git pull to update!")
        }
      }
    });
  }

  /**
   * Set the Minecraft Port and Accept the EULA.
   *
   * @param {Int} port - port to set.
   * @todo Implement promise.
   * @returns {Promise} with then on success.
   **/
  setport(port) {
    async.waterfall([
      /**
       * Get The Server properties
       **/
      (next) => {
        let props = this.getServerProps(); // Get the original properties
        if (props) {
          let oldport = props.get("server-port");

          // Here we set any minecraft server properties we need
          fs.readFile("server.properties", "utf8", function(err, data) {
            if (err) {
              return next(err);
            }

            let result = data.replace("server-port=" + oldport, "server-port=" + port);
            fs.writeFile("server.properties", result, "utf8", function(err) {
              if (err) return console.log(err);
            });
          });

          props = pr("server.properties"); // Get the new properties

          return next(false, props);
        }

        return next("Failed To Get Server Properties");
      },

      /**
       * Modify the eula to accept it.
       **/
      (props, next) => {
        fs.readFile("eula.txt", "utf8", function(err, data) {
            if (err) {
                return next(err);
            }

            let result = data.replace("eula=false", "eula=true");
            fs.writeFile("eula.txt", result, "utf8", next);
        });
      }
    ], err => {
      if(err) {
        return err;
      }

      return true;
    })
  }

  /**
   * execute a command on the minecraft server
   *
   * @param {String} command - command to execute
   * @returns {boolean} success
   **/
  execute(command) {

  }
}


getIP(function(err, ip) { // Get external IP for server
    if (err) {
        throw err;
    }
    outsideip = ip;
});
