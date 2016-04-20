"use strict";

const spawn = require("child_process").spawn,
      path  = require("path");

module.exports = (cb) => {
  let base   = path.join(__dirname, "../..");
  let server = path.join(base, "server.js");

  let sp = spawn("node", [server], {
    cwd: base
  });

  sp.on("error", err => {
    console.error("ERROR:", err);
  })

  sp.on("close", code => {
    console.log("server close with", code);
  });

  return cb();
}
