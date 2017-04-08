/**
 * API which allows plugins to interact with NodeMC.
 *
 * @author Mathew Da Costa <mathew678@hotmail.co.uk>
 * @license GPL-3.0
 */

"use strict";

const Logger = require("../logger.js");

class PluginAPI {
    /**
     * Creates an instance of PluginAPI.
     *
     * @param {object} logger - The logger
     */
    constructor(logger) {
        this.logger = logger;
    }

    /**
     * Create a new Logger for the plugin.
     *
     * @param {string} [name=""] - The name to use in the prefix of the logger
     *
     * @return {Object} A Logger (from lib/logger.js)
     */
    getLogger(name) {
        return new Logger(name);
    }
}


module.exports = {
    PluginAPI,
}
