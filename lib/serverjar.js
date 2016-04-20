"use strict";

// TO DO: Remove code repetetion here.

const request = require('request'),
      fs      = require('fs');

module.exports = (flav, ver, location, callback) => {
  // Flavour, version, location
  if (ver === "latest") {
    ver = "1.9";
  }

  if (flav === "vanilla") { // Vanilla
    request("https://s3.amazonaws.com/Minecraft.Download/versions/" + ver +
      "/minecraft_server." + ver + ".jar")
      .pipe(fs.createWriteStream(location + flav + "." + ver + ".jar"));
      callback("downloaded");
    }

  if (flav === "spigot") { // Spigot
    request("https://tcpr.ca/files/spigot/spigot-" + ver + "-R0.1-SNAPSHOT-latest.jar")
      .pipe(fs.createWriteStream(location + flav + "." + ver + ".jar"));
      callback("downloaded");
  } else {
    callback("invalid_jar");
  }
}
