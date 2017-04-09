  /**
 * Server Module.
 *
 * @author Jared Allard <jaredallard@outlook.com>
 * @license GPL3
 **/

"use strict";

const spawn   = require("child_process").spawn
const mkdirp  = require("mkdirp")
const path    = require("path")
const pr      = require("properties-reader")
const fs      = require("fs-promise")
const debug   = require("debug")("nodemc:server")

module.exports = class Server {
  constructor(config) {
    if(!config) {
      return null;
    }

    this.running = false;
    this.config  = config.nodemc
    this.log     = {}
    this.version = null;
    this.config  = config;

    this.log.path   = path.join(config.nodemc.logDirectory, "minecraft.log");
    this.log.route  = config.nodemc.logDirectory;
  }

  /**
   * Create a New Log Stream.
   *
   * @returns {undefined} or a Error on error...
   **/
  openLogStream() {
    mkdirp.sync(this.config.nodemc.logDirectory);

    this.log.stream = fs.createWriteStream(this.log.path, {
      flags: "w",
      defaultEncoding: "utf8",
      autoClose: false
    });
  }

  /**
   * Read the server.properties file.
   *
   * @returns {boolean/object} false on fail, or object on success
   **/
  getServerProps() {
    let srvprp;
    let props = path.join(this.config.minecraft.dir, "server.properties");
    try {
      srvprp = pr(props);
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

    debug("start", "started a server")
    this.openLogStream();

    this.running = true;
    this.spawn = spawn("java", [
        `-Xmx${config.minecraft.ram}`,
        `-Xms${config.minecraft.ram}`,
        "-jar",
        config.minecraft.jarfile,
        "nogui"
    ], {
      cwd: config.minecraft.dir
    });

    this.spawn.stdout.pipe(this.log.stream);
    this.spawn.stderr.pipe(this.log.stream);

    this.spawn.on("error", err => {
      debug("start", "err", err);
    });
    this.spawn.on("exit", code => {
      this.running = false;

      debug("start", "java exited with code", code);
    });
  }

  /**
   * Restart The server
   *
   * @todo WTF is going on here?
   * @param {Function} next - callback
   * @returns {AsyncFunction} So...
   */
  async restartServer() {
    if(this.running) {
      this.running = false;
      await this.stopServer("Restarting ...");
    }

    this.setport(this.port);
    this.startServer();
  }

  /**
   * Restart the server.
   *
   * @param {String} message - message to say why
   * @param {Function} next  - callback
   *
   * @returns {Promise} shutup jsdoc
   **/
  stopServer(message) {
    return new Promise(fulfil => {
      this.execute(`say [NodeMC] ${message}`);
      this.spawn.kill("SIGTERM");
      this.spawn.on("exit", fulfil);
    })
  }

  /**
   * Set the Minecraft Port and Accept the EULA.
   *
   * @param {Int} port - port to set.
   * @todo Implement promise.
   * @returns {AsyncFunction} Should be promise compatible.
   **/
  async setport(port) {
    const minecraftDir = this.config.minecraft.dir;
    const props        = this.getServerProps(); // Get the original properties
    const propFile     = path.join(minecraftDir, "server.properties");
    const eulaFile     = path.join(minecraftDir, "eula.txt");

    let oldport = props.get("server-port");

    // Here we set any minecraft server properties we need
    let data         = await fs.readFile(propFile, "utf8")
    let patchedData  = data.replace(`server-port=${oldport}`, `server-port=${port}`);
    await fs.writeFile(propFile, patchedData, "utf8")

    data             = await fs.readFile(eulaFile, "utf8")
    let patchedEula  = data.replace("eula=false", "eula=true");
    await fs.writeFile(eulaFile, patchedEula, "utf8");
  }

  /**
   * execute a command on the minecraft server
   *
   * @param {String} command - command to execute
   * @returns {boolean} success
   **/
  execute(command) {
    if(!this.running) return false;

    this.spawn.stdin.write(command + "\n");
    return true;
  }
}
