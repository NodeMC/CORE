/**
 * Logger class for, well, logging.
 *
 * @author Mathew Da Costa <mathew678@hotmail.co.uk>
 * @license GPL-3.0
 */

"use strict";

const levels = ["debug", "info", "warn", "error"];

module.exports = class Logger {

    constructor(name="", level="info", func=console.log) {
        this.debugLevel = level;
        this.logFunc = func;

        if (name !== "") {
            this.prefix = "[" + name + "] ";
        } else {
            this.prefix = "[default] ";
        }
    }

    rawLog(message, level="info") {
        if (levels.indexOf(level) >= levels.indexOf(this.debugLevel)) {
            if (typeof message !== "string") {
                message = JSON.stringify(message);
            }
            this.logFunc(this.prefix + "[" + level + "] " + message);
        }
    }

    log(message, level="info") {
        this.rawLog(message, level);
    }

    debug(message) {
        this.rawLog(message, "debug");
    }

    warn(message) {
        this.rawLog(message, "warn");
    }

    error(message) {
        this.rawLog(message, "error");
    }
}
