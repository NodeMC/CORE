/**
 * Download Different Editions of Minecraft and process them.
 *
 * @author NodeMC Team <https://github.com/NodeMC>
 * @license GPL3
 **/

"use strict";

const request = require("request"),
      path    = require("path"),
      fs      = require("fs");

module.exports = (flav, ver, location, next) => {
  let url;

  if (ver === "latest") {
    ver = "1.9.2";
  }

  let fpath  = path.join(location, flav + "." + ver + ".jar");
  let stream = fs.createWriteStream(fpath);
  stream.on("finish", () => {
    return next();
  })

  if(flav === "vanilla" ){ // Vanilla jars
    url = "https://s3.amazonaws.com/Minecraft.Download/versions/{{ver}}/minecraft_server.{{ver}}.jar";
  } else if(flav === "spigot") { // Spigot
    url = "https://tcpr.ca/files/spigot/spigot-{{ver}}-R0.1-SNAPSHOT-latest.jar";
  } else if(flav === "paperspigot") { // PaperSpigot
    url = "http://tcpr.ca/files/paperspigot/PaperSpigot-{{ver}}-R0.1-SNAPSHOT-latest.jar";
  } else {
    return next("invalid_jar");
  }

  url = url.replace(/{{ver}}/g, ver);

  // Create the request object
  request(url).pipe(stream);
}
