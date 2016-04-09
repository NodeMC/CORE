var fs = require('fs');
var path = require('path');
var files = fs.readdirSync("server_files/plugins");
var tmp;
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