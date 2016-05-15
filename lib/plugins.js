/**
 * Load and construct plugins.
 * 
 * @author Mathew Da Costa <mathew678@hotmail.co.uk>
 * @license GPL-3.0
 */

"use strict";

const express  = require("express"),
      async    = require("async"),
      path     = require("path"),
      fs       = require("fs"),
      eventlib = require("./events.js")

module.exports = class PluginManager {
    
    /**
     * Plugin Manager
     * 
     * @param {Object} stage  - the stage system
     * @param {Object} events - the core event manager
     * @param {Object} app    - the express app
     * @param {Object} server - the server class
     * @param {Object} log    - the logger function
     * 
     * @returns {Object} the class
     */
    constructor(stage, events, app, server, log) {
        this.log          = log;
        this.stage        = stage;
        this.app          = app;
        this.coreEvents   = events;
        this.pluginEvents = eventlib(log);
        this.plugins      = {};
        
        this.initPlugins(app, server, "./plugins/");
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
    loadPlugins(app, server, dir) {
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
                            return next(loadedPlugins, err);
                        }

                        return next(loadedPlugins);
                    });
                });
            },
            /**
             * Construct plugins (begin another stage here)
             */
            (loadedPlugins, next) => {
                async.each(loadedPlugins, (plugin, next) => {
                    plugins[plugin.id] = plugin;
                    plugins[plugin.id].pluginClass = plugins[plugin.id].plugin(coreEvents, pluginEvents, log);
                    plugins[plugin.id].pluginClass.initRoutes(new express.Router());
                }, err => {
                    if(err) {
                        return next(plugins, err);
                    }

                    return next(plugins);
                });
            }
        ], (err, plugins) => {
            if (err) {
                throw err;
            }
            log("Loaded", Object.keys(plugins).length, "plugins.");
        });
    }
    
}