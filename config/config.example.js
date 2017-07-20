module.exports = {
  "servers": [],
  "nodemc": {
    "apikey": "",
    "version": { // Don't change this section.
      "core": "6.0.0",
      "rest": "2.0.0",
      "plugin": "2.0.0",
      "wrapper": "1.0.0"
    },
    "port": 80,
    "logDirectory": "./logs",
    "manager": "nodemc"
  },
  "dashboard": {
    "setup": "./frontend/setup",
    "dashboard": "./frontend/dashboard"
  },
  "minecraft": {
    "dir": "./minecraft" // relative to NodeMC base directory.
  },
  "firstrun": true
}
