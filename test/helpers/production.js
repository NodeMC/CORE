/**
 * Simulate production on/off.
 **/

"use strict";

const path = require("path"),
      fs   = require("fs");

module.exports = class Production {
  constructor() {
    this.config = {
      path: path.join(__dirname, "../../config")
    };
    this.in     = false;

    this.config.production = path.join(this.config.path, "config.json");
    this.config.staging    = path.join(this.config.path, "config.example.json");
  }

  on(next) {
    this.in     = true;

    let nd = fs.createWriteStream(this.config.production);
    fs.createReadStream(this.config.staging).pipe(nd);
    nd.on("close", () => {
      let staging = require(this.config.production);
      staging.firstrun = false;

      fs.writeFile(this.config.production, JSON.stringify(staging), err => {
        if(err) {
          return next(false);
        }

        return next(true);
      })
    })
  }

  off(next) {
    this.in     = false;
    fs.unlinkSync(path.join(this.config.production));

    return next(false);
  }
}
