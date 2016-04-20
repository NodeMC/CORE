/**
 * Basic Stage Metadata handler.
 *
 * @todo Cleanup repetative code
 **/

"use strict";

const events = require("events");
const log = function() {
  let args = Array.prototype.slice.call(arguments, 0);
  args[0]  = "main: " + args[0];
  console.log.apply(console, args);
}


let stage    = new events.EventEmitter();
stage.Stage = 0;
stage.Sub   = "INIT";
stage.Name  = "unspec"

stage.on("start", data => {
  stage.Stage = data.stage;
  stage.Sub   = data.sub;
  stage.Name  = data.name;

  log(data.sub, "stage", data.stage+" ("+data.name+"): Started");
})

stage.on("finished", data => {
  stage.Stage = 0;
  stage.Sub   = data.sub;
  stage.Name  = data.name;

  log("INIT stage", data.stage+" ("+data.name+"): Finished");
});

stage.on("failed", data => {
  stage.Stage = data.stage-1;
  stage.Sub   = data.sub;
  stage.Name  = data.name;

  log("INIT stage", data.stage+" ("+data.name+"): Failed");
  process.exit(1);
});


/**
 * Meta Methods.
 **/

stage.start = (level, name, sub) => {
  stage.emit("start", {
    stage: level,
    name: name,
    sub: sub
  });
};

stage.finished = (level, name, sub) => {
  stage.emit("finished", {
    stage: level,
    name: name,
    sub: sub
  });
};

stage.failed = (level, name, sub) => {
  stage.emit("failed", {
    stage: level,
    name: name,
    sub: sub
  });
};

module.exports = stage;
