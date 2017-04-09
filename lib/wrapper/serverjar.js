/**
 * Download Different Editions of Minecraft and process them.
 *
 * TODO: Handle Errors on File Downloading
 *
 * @author NodeMC Team <https://github.com/NodeMC>
 * @license GPL3
 **/

"use strict";

const request = require("request")
const path    = require("path")
const fs      = require("fs")
const debug   = require("debug")("nodemc:serverjar")

/**
 * Download a version of Minecraft.
 *
 * @param {String} flav - Flavor of Minecraft.
 * @param {String} ver  - Version of x flavor.
 * @param {String} location - Directory to store downloaded jar in.
 * @returns {Promise} the basics.
 **/
module.exports = (flav, ver, location) => {
  return new Promise((fulfil, reject) => {
    let url;

    if (ver === "latest") ver = "1.9.2";

    let fpath  = path.join(location, `${flav}.${ver}.jar`);
    let stream = fs.createWriteStream(fpath);
    stream.on("finish", () => {
      return fulfil()
    })

    switch(flav) {
      default:
        reject("Invalid Flavor");
      break

      case "vanilla":
        url = `https://s3.amazonaws.com/Minecraft.Download/versions/${ver}/minecraft_server.${ver}.jar`;
      break

      case "spigot":
        url = `https://tcpr.ca/files/spigot/spigot-${ver}-R0.1-SNAPSHOT-latest.jar`;
      break

      case "paperspigot":
        url = `http://tcpr.ca/files/paperspigot/PaperSpigot-${ver}-R0.1-SNAPSHOT-latest.jar`;
      break
    }

    debug("downloading", `type '${flav}' from '${url}'`)

    // Create the request object
    request(url).pipe(stream);
  })
}
