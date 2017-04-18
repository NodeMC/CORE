/**
 * Wrapper for Minecraft server.
 *
 * @author NodeMC Team <https://github.com/NodeMC>
 * @license GPL3
 */

"use strict";

// Node modules
const ipc = require("node-ipc");
const fs = require("fs-promise");

// Internal modules
const server    = require("./server.js"),
      serverjar = require("./serverjar.js");

let config;

fs.createFile("./running");

try {
    config = require("./wrapperconfig.js");
} catch (e) {
    console.error("Configuration is missing. Using default config, but this may cause conflicts!");
    config = require("./wrapperconfig.example.js");
}

process.on("exit", () => {
    fs.remove("./running");
});
