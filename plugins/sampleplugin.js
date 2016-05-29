class SamplePlugin {
    constructor(coreEvents, pluginEvents, loggerFunction) {
        this.coreEvents = coreEvents;
        this.pluginEvents = pluginEvents;
        this.log = loggerFunction;

        loggerFunction("SamplePlugin has been constructed!")
    }

    initRoutes(router) {
        // Initialise routes here!
        this.log("SamplePlugin is now (read: would be) initialising routes!")
        return router;
    }
}

module.exports = {
    name: "Sample Plugin", // Name of the plugin
    id: "space.nodemc.sampleplugin", // Unique ID for the plugin (formatted like a Java package)
    version: "1.0.0", // Version of the plugin
    target: "2.0.0", // NodeMC Plugin API target (which version of the API the plugin is written for)
    desc: "Sample Plugin for NodeMC (Plugin API 2.0.0)", // Description of the plugin
    perms: ["route"], // List of permissions which the plugin is requesting
    comments: [ // Plugin comments
        "These won't get read by NodeMC.",
        "You can include instructions for use, credits or whatever you want here."
    ],
    plugin: SamplePlugin // The plugin class
};
