var fs = require('fs');
var path = require('path');
var files = fs.readdirSync("server_files/plugins");
var tmp;
<<<<<<< HEAD
var plugins = {};

function loadPlugins() {
    for (var i in files) {
        if (path.extname(files[i]) == ".json") {
            registerPlugin("../server_files/plugins/" + files[i]);
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
        routes: pluginJSON.routes,
        originalJSON: pluginJSON
    };
    if (plugin.loadJS) {
        pluginJS = require("../server_files/plugins/" + plugin.id + "/plugin.js");
        pluginJS.init();
    }
    for (var routeKey in pluginJSON.routes) {
        if (!pluginJSON.hasOwnProperty(routeKey)) continue;
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

/*
 * Many years ago... this feature was started...
 * And now, it has been achieved...
 * Full Node.js module support has been achieved
 * for plugins. 
 * And now, I must go, for it has been too long since
 * I used
 * the loo.
 */
function handleRoute(ref, route, args, method) {
    for (var pluginID in plugins) {
        var plugin = plugins[pluginID];
        var js = require("../server_files/plugins/" + plugin.id + "/plugin.js");
        // console.log(js);
        if (plugin.ref == ref) {
            if (plugin.routes[route].method == method || plugin.routes[route].method == "*") {
                if (plugin.routes[route].reply.split(":")[0] === "func") {
                    var fun = "js." + plugin.routes[route].reply.split(":")[1] + "('" + args + "')";
                    console.log(fun);
                    var result = eval(fun);
                    return result;
                } else {
                    return plugin.routes[route].reply;
                }
            }else{
                return "Use " + plugin.routes[route].method + " for this path!";
            }
            }
        }
    }

    module.exports = {
        getPlugins: getPlugins,
        loadPlugins: loadPlugins,
        handleRoute: handleRoute
    };
=======
var plugins = [];

function getPlugins() {
    for (var i in files) {
        if (path.extname(files[i]) === ".json") {
			plugins[i] = JSON.parse(fs.readFileSync("./server_files/plugins/" + files[i], 'utf8'));
        }
    }
    return plugins;
	plugins = [];
}

module.exports = {
	pluginList: function(){
		return getPlugins();
	}
}
>>>>>>> master
