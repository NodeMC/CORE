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
    name: "Sample Plugin",
    id: "space.nodemc.sampleplugin",
    version: "1.0.0",
    desc: "Sample Plugin for NodeMC v6",
    plugin: SamplePlugin
};
