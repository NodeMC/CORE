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

    /**
     * Initialise the installed plugins.
     *
     * @param {Object} app    - the express app
     * @param {Object} server - the server class
     * @param {String} dir    - the directory to search in for plugins
     *
     * @returns {undefined} async
     */
    initPlugins(dir) {
        let log           = this.log,
            stage         = this.stage,
            plugins       = this.plugins,
            coreEvents    = this.coreEvents,
            pluginEvents  = this.pluginEvents;

        async.waterfall([
            /**
             * Load plugins (start stage here)
             */
            next => {
                stage.start(2, "plugin::load", "INIT");
                let PLUGINS = dir;

                fs.readdir(PLUGINS, (err, list) => {
                    if (err) {
                        return next(err);
                    }

                    let loadedPlugins = [];

                    async.each(list, (plugin, next) => {
                        let plugins = PLUGINS;
                        if (!path.isAbsolute(PLUGINS)) {
                            plugins = path.join("..", PLUGINS)
                        }

                        let Path = path.join(plugins, plugin);
                        let pluginJs;

                        try {
                            pluginJs = require(Path);
                            log("Loaded plugin ", path);
                        } catch (e) {
                            log(path, "could not be loaded.");
                            return next(e);
                        }

                        loadedPlugins.push(pluginJs);
                    }, err => {
                        if(err) {
                            stage.failed(2, "plugin::load", "INIT");
                            return next(err, loadedPlugins);
                        }

                        stage.finished(2, "plugin::load", "INIT");
                        return next(null, loadedPlugins);
                    });
                });
            },
            /**
             * Register plugins (begin another stage here)
             */
            (loadedPlugins, next) => {
                stage.start(3, "plugin::register", "INIT");
                let plugins = this.loadedPlugins;
                let config = require("../config/config.json");
                async.each(loadedPlugins, (plugin, next) => {
                    if (semver.satisfies(config.nodemc.version.plugin, plugin.target)) {
                        plugins[plugin.id] = {};
                        plugins[plugin.id].name = plugin.name;
                        plugins[plugin.id].id = plugin.id;
                        plugins[plugin.id].version = plugin.version;
                        plugins[plugin.id].target = plugin.target;
                        plugins[plugin.id].apiconf = plugin.apiconf;
                        plugins[plugin.id].original = plugin;
                    } else {
                        log(plugin.name, "is not compatible with this version of NodeMC.");
                    }
                    next();
                }, err => {
                    if(err) {
                        stage.failed(3, "plugin::register", "INIT");
                        return next(err, plugins);
                    }

                    stage.finished(3, "plugin::register", "INIT");
                    return next(null, plugins);
                });
            },
            /**
             * Construct plugins (new stage)
             */
            (plugins, next) => {
                stage.start(4, "plugin::construct", "INIT");
                async.each(plugins, (plugin, next) => {
                    plugin.class = plugin.original.plugin(log);
                }, err => {
                    if(err) {
                        stage.failed(4, "plugin::construct", "INIT");
                        return next(err, plugins);
                    }

                    stage.finished(4, "plugin::construct", "INIT");
                    return next(null, plugins);
                });
            },
            /**
             * Register plugin events (again, new stage)
             */
            (plugins, next) => {
                stage.start(5, "plugin::registerEvents", "INIT");
                let wrapper = eventlib.wrapper(pluginEvents, true, false, false);
                async.each(plugins, (plugin, next) => {
                    plugin.class.registerEvents(wrapper);
                }, err => {
                    if(err) {
                        stage.failed(5, "plugin::registerEvents", "INIT");
                        return next(err, plugins);
                    }

                    stage.finished(5, "plugin::registerEvents", "INIT");
                    return next(null, plugins);
                });
            },
            /**
             * Allow plugin event attachment (new stage yet again)
             */
            (plugins, next) => {
                stage.start(6, "plugin::listenEvents", "INIT");
                let coreWrapper = eventlib.wrapper(coreEvents, false, false, true);
                let pluginWrapper = eventlib.wrapper(pluginEvents, false, true, true);
                async.each(plugins, (plugin, next) => {
                    plugin.class.registerEvents(coreWrapper, pluginWrapper);
                }, err => {
                    if(err) {
                        stage.failed(6, "plugin::listenEvents", "INIT");
                        return next(err, plugins);
                    }

                    stage.finished(6, "plugin::listenEvents", "INIT");
                    return next(null, plugins);
                });
            },
            /**
             * Initialise plugin routes (new stage, seeing a pattern here?)
             */
            (plugins, next) => {
                stage.start(7, "plugin::routes", "INIT");
                async.each(plugins, (plugin, next) => {
                    if (plugin.apiconf.route.enabled) {
                        let mount = path.join("/plugins/", plugin.name).replace(/\\/g, "/");
                        let router = plugin.class.initRoutes(new express.Router())
                        app.use(mount, router);
                    }
                }, err => {
                    if(err) {
                        stage.failed(7, "plugin::routes", "INIT");
                        return next(err, plugins);
                    }

                    stage.finished(7, "plugin::routes", "INIT");
                    return next(null, plugins);
                });
            }
        ], (err, plugins) => {
            if (err) {
                throw err;
            }
            this.loadedPlugins = plugins;
            log("Loaded", Object.keys(plugins).length, "plugins.");
        });
    }

}