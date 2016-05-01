/**
 * An events system for NodeMC.
 *
 * @author Mathew Da Costa <dev@mdacosta.xyz>
 * @license GPL-3.0
 **/

"use strict";

const async = require("async");

const Event = class {

    /**
     * A class to represent an event.
     * 
     * @param {Object} name   - the name of the event
     * 
     * @returns {Object} The event
     */
    constructor(name) {
        this.name = name;
        this.asyncListeners = [];
        this.syncListeners = [];
        this.onceAsyncListeners = [];
        this.onceSyncListeners = [];
        this.finalListeners = [];
    }

    /**
     * Add a synchronous listener.
     * 
     * @param (function) listener - Function to be added.
     */
    addSyncListener(listener) {
        this.syncListeners.push(listener);
    }
    
    addAsyncListener(listener) {
        this.asyncListeners.push(listener);
    }

    addOnceSyncListener(listener) {
        this.onceSyncListeners.push(listener);
    }
    
    addOnceAsyncListener(listener) {
        this.onceAsyncListeners.push(listener);
    }
    
    addFinalListener(listener) {
        this.finalListeners.push(listener);
    }
    
    on(listener, sync = false, once = false) {
        if (once) {
            if (sync) {
                this.addOnceSyncListener(listener);
            } else {
                this.addOnceAsyncListener(listener);
            }
        } else {
            if (sync) {
                this.addSyncListener(listener);
            } else {
                this.addAsyncListener(listener);
            }
        }
    }
    
    fireSync(data) {
        for (let listener of this.syncListeners) {
            let cancelled = listener(data);
            if (cancelled) {
                return false;
            }
        }
        return true;
    }
    
    fireAsync(data) {
        async.each(this.asyncListeners, function(listener, callback) {
            let err = null;
            try {
                listener(data);
            } catch (e) {
                err = e;
            } finally {
                this.onceAsyncListeners.splice(this.onceAsyncListeners.indexOf(listener), 1);
                callback(err);
            }
        })
    }
    
    fireOnceSync(data) {
        for (let listener of this.syncListeners) {
            let cancelled = listener(data);
            this.onceSyncListeners.splice(this.onceSyncListeners.indexOf(listener), 1)
            if (cancelled) {
                return false;
            }
        }
        return true;
    }
    
    fireOnceAsync(data) {
        async.each(this.onceAsyncListeners, function(listener, callback) {
            let err = null;
            try {
                listener(data);
            } catch (e) {
                err = e;
            } finally {
                this.onceAsyncListeners.splice(this.onceAsyncListeners.indexOf(listener), 1);
                callback(err);
            }
        })
    }
    
    fireFinal(data) {
        for (let listener of this.finalListeners) {
            listener(data);
        }
    }
    
    fire(data = {}) {
        this.fireAsync(data);
        this.fireOnceAsync(data);
        let onceResult = this.fireOnceSync(data);
        if (!onceResult) {
            return;
        }
        let multiResult = this.fireSync(data);
        if (!multiResult) {
            return;
        }
        this.fireFinal(data);
    }
}

module.exports = class EventManager {

    /**
     * Event manager
     * 
     * @param {function} log  - The logger function
     * 
     * @returns {Object} The event manager
     */
    constructor() {
        this.events = {};
    }
    
    registerEvent(name) {
        this.events[name] = new Event(name);
    }
    
    on(eventName, listener, sync = false, once = false, final = false) {
        let event = this.events[eventName];
        if (event === null || typeof event == "undefined") {
            throw new Error("Could not attach listener to " + eventName + "; event does not exist.")
        }
        if (final) {
            event.addFinalListener(listener);
        } else {
            event.on(listener, sync, once);
        }           
    }
    
    emit(eventName, data) {
        let event = this.events[eventName];
        if (event === null || typeof event == "undefined") {
            throw new Error("Could not emit event " + eventName + "; event does not exist.")
        }
        event.fire(data);
    }
}
