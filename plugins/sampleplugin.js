class SamplePlugin {
    constructor( loggerFunction) {
        this.log = loggerFunction;

        loggerFunction("SamplePlugin has been constructed!")
    }

    registerEvents(pluginEventWrapper) {
        pluginEventWrapper.registerEvent("sample plugin event");
    }

    attachEvents(coreEventWrapper, pluginEventWrapper) {
        this.coreEvents = coreEventWrapper;
        this.pluginEvents = pluginEventWrapper;
    }

    initRoutes(router) {
        // Initialise routes here!
        this.log("SamplePlugin is now (read: would be) initialising routes!")
        router.get("helloworld", (req, res) => {
            res.success("'Hello World!' says the NodeMC Sample Plugin")
        })
        return router;
    }
}

module.exports = {
    name: "Sample Plugin", // Name of the plugin
    id: "space.nodemc.sampleplugin", // Unique ID for the plugin (formatted like a Java package)
    version: "1.0.0", // Version of the plugin
    target: "2.0.0", // NodeMC Plugin API compatibility string - see node-semver for valid strings
    desc: "Sample Plugin for NodeMC (Plugin API 2.0.0)", // Description of the plugin
    apiconf: { // Configuration for API access
        route: { // Configuration for route access
            enabled: true // Needs to be enabled for plugin to get a express#Router - Default: false
        },
        socket: { // Configuration for sockets access
            enabled: true, // Needs to be enabled for plugin to get a WebSocket namespace - Default: false
            namespace: "example" // The WebSocket namespace for the plugin - Default: Plugin ID
        },
        auth: { // Configuration for the Authentication API
            enabled: true // Needs to be enabled for plugin to have access to the auth API - Default: false
        }
    },
    comments: [ // Plugin comments
        "These won't get read by NodeMC.",
        "You can include instructions for use, credits or whatever you want here.",
        "For example:",
        "Credits: Gabriel Simmer (@gmemstr) for NodeMC itself, Jared Allard (@jaredallard) for the major rewrites and Mathew Da Costa (@md678685) for work on the plugin system",
        "Instructions: Drop this in plugins/ and NodeMC will automatically load the plugin."
    ],
    plugin: SamplePlugin // The plugin class
};
