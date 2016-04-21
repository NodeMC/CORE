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
    if(!config) {
      return null;
    }

    this.running = false;
    this.config  = config.nodemc
    this.log     = null;
    this.version = null;
    this.config  = config;
  }

  /**
   * Read the server.properties file.
   *
   * @returns {boolean/object} false on fail, or object on success
   **/
  getServerProps() {
    let srvprp;
    try {
      srvprp = pr("server.properties");
    } catch(e) {
      return false;
    }

    return srvprp;
  }

  /**
   * Start The Server
   *
   * @returns {undefined} nothing to return...
   **/
  startServer() {
    let config = this.config;

    console.log("debug:", "server start")

    this.running = false;
    this.spawn = spawn("java", [
        "-Xmx" + config.minecraft.ram,
        "-Xms" + config.minecraft.ram,
        "-jar",
        config.minecraft.jarfile,
        "nogui"
    ], {
      cwd: config.minecraft.dir
    });

    this.spawn.stdout.pipe(process.stdout);
    this.spawn.stderr.pipe(process.stderr);

    this.spawn.on("error", err => {
      return console.error("err:", err);
    });
    this.spawn.on("exit", code => {
      this.running = false;

      return console.info("java exited with code", code);
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
    if(!this.running) {
      return false;
    }

    this.spawn.write(command+"\n");
    return true;
  }
}
