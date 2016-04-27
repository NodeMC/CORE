/**
 * Load and construct plugins.
 * 
 * @author Mathew Da Costa <mathew678@hotmail.co.uk>
 * @license GPL-3.0
 */

"use strict";

const express = require("express"),
      async   = require("async"),
      path    = require("path"),
      fs      = require("fs");

module.exports = class PluginManager {
    
    /**
     * Plugin Manager
     * 
     * @param {Object} stage  - the stage system
     * @param {Object} app    - the express app
     * @param {Object} server - the server class
     * @param {Object} log    - the logger object
     * 
     * @returns {Object} the class
     */
    constructor(stage, app, server, log) {
        this.log   = log;
        this.stage = stage;
        this.app   = app;
        
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
    initPlugins(app, server, dir) {
        let log   = this.log,
            stage = this.stage;
        
        async.waterfall([
            /**
             * Initialise plugins
             */
            function(next) {
                let PLUGINS = dir;
                
                fs.readdir(PLUGINS, (err, list) => {
                    if (err) {
                        return next(err);
                    }
                    
                    async.each(list, function(plugin, next) {
                        let plugins = PLUGINS;
                        if (!path.isAbsolute(PLUGINS)) {
                            plugins = path.join("..", PLUGINS)
                        }
                        
                        let Path = path.join(plugins, plugin);
                        if (!fs.lstatSync(Path).isDirectory()) {
                            log(plugin, "isn't a valid plugin directory.");
                            return next();
                        }
                        
                        let pluginJson,
                            pluginJs;
                        try {
                            pluginJson = require(path.join(Path, "plugin.json"));
                            pluginJs   = require(path.join(Path, "plugin.js"));
                        } catch (e) {
                            return next(e);
                        }
                    })
                })
            }
        ])
    }
    
}