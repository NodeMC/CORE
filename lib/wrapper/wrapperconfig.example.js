module.exports = {
    "minecraft": {
      "ram": "512M",
        "port": 25565,
        "dir": "./minecraft",
        "type": "vanilla",
        "jarfile": "vanilla-1.9.jar",
        "version": "1.9",
        "ip": "localhost"
    },
    "nodemc": { // this section is different to regular nodemc section
        "manager": "nodemc", // Name of Core manager, in case multiple Cores are running on one machine
        "logDirectory": "./logs", // Directory for NodeMC log stream
        "wrapperName": "example", // Name of this wrapper, to identify with Core
    }
}