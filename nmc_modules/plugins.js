var fs = require('fs');
var path = require('path');
var files = fs.readdirSync("server_files/plugins");
var tmp;
var plugins = {};

function loadPlugins() {
    for (var i in files) {
        if (path.extname(files[i]) == ".json") {
            registerPlugin("./server_files/plugins/" + files[i]);
        }
    }
}

function registerPlugin(path) {
    var pluginJS = null;
    var pluginJSON = require(path);
    var plugin = {
        id: pluginJSON.id,
        ref: pluginJSON.ref,
        name: pluginJSON.name,
        desc: pluginJSON.description,
        loadJS: pluginJSON.js,
        routes: {},
        originalJSON: pluginJSON
    };
    if (plugin.loadJS) {
        pluginJS = require("./server_files/plugins/" + plugin.id + "plugin.js");
        pluginJS.init();
    }
    for (var routeKey in pluginJSON.routes) {
        if (!pluginJSON.hasOwnProperty(key)) continue;
        var route = {
            method: pluginJSON.routes[routeKey].method,
            args: pluginJSON.routes[routeKey].args
        };
        var routeReply = pluginJSON.routes[routeKey].reply;
        if (routeReply.substring(0, 5) == "func:") {
            if (pluginJS !== null) {
                route.reply = pluginJS[routeReply.substring(5)];
            } else {
                throw "Bad route in plugin " + plugin.name + " - JS should be enabled!";
            }
        } else {
            route.reply = function() {
                return routeReply;
            };
        }
        plugin.routes[routeKey] = route;
    }
    plugins[plugin.id] = plugin;
}

function getPlugins() {
    return plugins;
}

function handleRoute(ref, route, args) {
    for (var pluginID in plugins) {
        var plugin = plugins[pluginID];
        if (plugin.ref == ref) {
            return plugin.routes[route].reply(args);
        }
    }
}

module.exports = {
	getPlugins: getPlugins,
    loadPlugins: loadPlugins,
    handleRoute: handleRoute
};