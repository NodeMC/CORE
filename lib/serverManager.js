/**
 * Spawn wrapper processes and expose them to core.
 *
 * @author NodeMC Team <https://github.com/nodemc>
 * @license MIT
 */
const EventEmitter = require("events").EventEmitter;
const debug = require("debug")("nodemc:servermanager");
const ipc   = require("node-ipc");

module.exports = class ServerManager {
    /**
     * Server manager.
     *
     * @param {String} name The name of the manager's IPC socket.
     * @param {Array} wrappers The wrappers to connect to.
     */
    constructor(name, wrappers) {
        this.servers = {};

        ipc.config.appspace = "nodemc.";
        ipc.config.id = name;

        this.startIpc().then((ipcServer) => {
            this.ipc = ipcServer;
            this.attachIpc();
        });

        this.launchWrappers(wrappers);
    }

    /**
     * Start an IPC server
     * 
     * @returns {Promise} Resolves when the IPC server is started.
     */
    startIpc() {
        let promise = new Promise((resolve) => {
            ipc.serve(() => {
                debug(`IPC server started at ${ipc.config.appspace}${ipc.config.id}.`);
                resolve(ipc.server);
            });
        });

        ipc.server.start();

        return promise;
    }

    /**
     * Attach listeners to the IPC server.
     *
     * @returns {undefined}
     */
    attachIpc() {
        this.ipc.on("connect", (socket) => {
            debug("Wrapper connected: %O", socket);
        });

        this.ipc.on("register", (wrapperInfo, socket) => {
            debug("Registering wrapper: %O", socket);
            try {
                this.servers[wrapperInfo.name] = new Server(wrapperInfo);
            } catch (err) {
                debug("Could not register wrapper. \n%s", err.stack);
            }
        });
    }
}

/**
 * Represents a server managed by a wrapper.
 * 
 * @class Server
 */
class Server extends EventEmitter {
    constructor(wrapperInfo) {
        super();
        this.name = wrapperInfo.name;
    }
}