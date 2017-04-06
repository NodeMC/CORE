/**
 * API which allows plugins to interact with NodeMC.
 *
 * @author Mathew Da Costa <mathew678@hotmail.co.uk>
 * @license GPL-3.0
 */

"use strict";

const express = require("express"),
      path = require("path");

module.exports = class PluginAPI {

    /**
     * Creates an instance of PluginAPI.
     *
     * @param {Object} loader - The plugin loader
     * @param {Object} plugin - The plugin
     * @param {Object} coreEvents - The core event emitter
     * @param {Object} pluginEvents - The plugin event emitter
     * @param {Object} app - The Express app
     * @param {Object} server - The server manager
     * @param {Object} logger - The logger
     * @param {Object} io - The Socket.IO namespace
     * @param {Object} auth - The authentication handler
     */
    constructor(loader, plugin, coreEvents, pluginEvents, app, server, logger, io, auth) {
        this.loader = loader;
        this.plugin = plugin;
        this.coreEvents = coreEvents;
        this.pluginEvents = pluginEvents;
        this.app = app;
        this.server = server;
        this.logger = logger;
        this.io = io;
        this.auth = auth;
    }

    /**
     * Create and attach a new express#Router.
     *
     * @param {string} [name=""] - Where to mount the router (/plugins/<plugin name>/<name>/)
     *
     * @return {Object} An express#Router.
     */
    getRouter(name="") {
        let mount = path.join("/plugins/", this.plugin.name, name).replace(/\\/g, "/");
        let router = new express.Router()
        this.app.use(mount, router);
        return router;
    }

    /**
     * Add a function as a new authentication handler.
     *
     * @param {function} func - Function called whenever client tries to authenticate
     *
     * @return {undefined}
     */
    addAuthHandler() {

    }

}
