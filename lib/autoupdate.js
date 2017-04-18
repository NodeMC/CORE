/**
* Auto-update module.
*
* @author Gabriel Simmer <gabriel@nodemc.space>
* @license GPL3
*
* @callback success
**/

"use strict";

const spawn = require("child_process").exec,
	getfile = require("request"),
	semver  = require("semver");

module.exports = class Updater {

	/**
	 * Check the version of NodeMC.
	 *
	 * @todo implement promise
	 *
	 * @param {String} current - Current NodeMC version
	 * @param {success} callback - Callback if there is an update
	 **/
	checkVersion(current, callback) {
		console.log("Current version: " + current);
		getfile.get("https://raw.githubusercontent.com/NodeMC/NodeMC-CORE/master/version.txt", (error, res, body) => {
			if (!error && res.statusCode == 200) {
				let version = body;
				if (semver.lt(current, version)) {
					console.log("NodeMC is not up-to-date.");
					console.log("Your version: " + current + "; Newest version: " + version);
					// Optional: If user is not running from binary, attempt to self-update
					callback(true);
				} else {
					callback(false);
				}
			} else {
				callback(false);
			}
		});
	}
	/**
	 * git pull latest version of NodeMC from master.
	 *
	 * @todo move checkVersion over here
	 * @todo implement update for binary
	 *
	 * @param {success} callback - Callback on success or failure
	 **/
	updateGit(callback) {
		console.log("Attempting to update from git...");
		var gp = spawn("git pull origin master", { cwd: "../tmp" });
		gp.stdout.on('data', (data) => {
			//console.log(data);
			if (data.indexOf("Already up-to-date") > -1) {
				console.log("Git reports up-to-date, doing nothing");
				console.log("(although NodeMC reports a newer version is available?)");
				callback(true);
			} else {
				console.log("NodeMC updated, restart for new version.");
				callback(false);
			}
		});
	}
}
