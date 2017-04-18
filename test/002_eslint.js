"use strict";

const lint = require("mocha-eslint");
const paths = [
  "./backend/routes/*",
  "./lib/*",
  "./server.js"
];

// Specify style of output
const options = {};
options.formatter = "compact";
options.alwaysWarn = false;

// Run the tests
lint(paths, options);
