/**
 * Load and construct plugins.
 *
 * @author Mathew Da Costa <mathew678@hotmail.co.uk>
 * @license GPL-3.0
 */

"use strict";

const express  = require("express"),
      semver   = require("semver"),
      async    = require("async"),
      path     = require("path"),
      fs       = require("fs"),
      eventlib = require("../events.js"),
      api      = require("./api.js");

module.exports = class PluginLoader {

    /**
     * Plugin Manager
     *
     * @param {Object} stage  - the stage system
     * @param {Object} events - the core event manager
     * @param {Object} app    - the express app
     * @param {Object} server - the server class
     * @param {Object} log    - the logger function
     */
    constructor(stage, events, app, server, log) {
        this.log          = log;
        this.stage        = stage;
        this.server       = server;
        this.app          = app;
        this.coreEvents   = events;
        this.pluginEvents = eventlib.manager(log);
        this.plugins      = {};
        this.config       = require("../config/config.json");

        this.loadAll("./plugins/");
    }

    /**
     * Load the plugin at a given path.
     *
     * @param path - The path of the plugin to load
     * @returns {undefined}
     */
    loadPlugin(path) {
        let pluginJs;
        try {
            pluginJs = require(path);
        } catch (e) {
            return;
        }

        if (!semver.satisfies(this.config.nodemc.version.plugin, pluginJs.target)) {
            this.log(pluginJs.name, "is not compatible with this version of NodeMC.\nThe plugin targets", pluginJs.target, "but the plugin API version is", this.config.nodemc.version.plugin);
            return;
        }

        this.plugins[pluginJs.id] = {};

        let plugin = this.plugins[pluginJs.id];

        plugin.name = pluginJs.name;
        plugin.id = pluginJs.id;
        plugin.version = plugin.version;
        plugin.original = pluginJs;
        plugin.object = plugin.original.plugin(new api(this, plugin, this.coreEvents, this.pluginEvents, this.app, this.server, this.logger, /* TODO */ null, null));
    }

}