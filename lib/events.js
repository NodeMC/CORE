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

    /**
     * Add an asynchronous listener.
     *
     * @param (function) listener - Function to be added.
     */
    addAsyncListener(listener) {
        this.asyncListeners.push(listener);
    }

    /**
     * Add a synchronous one-time listener.
     *
     * @param (function) listener - Function to be added.
     */
    addOnceSyncListener(listener) {
        this.onceSyncListeners.push(listener);
    }

    /**
     * Add an asynchronous one-time listener.
     *
     * @param (function) listener - Function to be added.
     */
    addOnceAsyncListener(listener) {
        this.onceAsyncListeners.push(listener);
    }

    /**
     * Add a final listener.
     *
     * @param (function) listener - Function to be added.
     */
    addFinalListener(listener) {
        this.finalListeners.push(listener);
    }

    /**
     * Add a listener to the event.
     *
     * @param listener The function to be added.
     * @param {boolean} [sync=false] (description)
     * @param {boolean} [once=false] (description)
     */
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

    /**
     * Fire synchronous listeners.
     *
     * @param data The data to pass to the listeners.
     * @returns Whether the listeners were fired without cancelling or not.
     */
    fireSync(data) {
        for (let listener of this.syncListeners) {
            let cancelled = listener(data);
            if (cancelled) {
                return false;
            }
        }
        return true;
    }

    /**
     * Fire asynchronous listeners.
     *
     * @param data The data to pass to the listeners.
     */
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

    /**
     * Fire synchronous one-time listeners and remove them.
     *
     * @param data The data to pass to the listeners.
     * @returns Whether the listeners were fired without cancelling or not.
     */
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

    /**
     * Fire asynchronous one-time listeners and remove them.
     *
     * @param data The data to pass to the listeners.
     */
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

    /**
     * Fire final listeners.
     *
     * @param data The data to pass to the listeners.
     */
    fireFinal(data) {
        for (let listener of this.finalListeners) {
            listener(data);
        }
    }

    /**
     * Fire the event's listeners.
     *
     * @param data The data to pass to the listeners.
     */
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

module.exports.manager = class EventManager {

    /**
     * Event manager
     *
     * @param {function} log The logger function
     *
     * @returns {Object} The event manager
     */
    constructor(log) {
        this.events = {};
        this.log = log;
    }

    /**
     * Register a new event.
     *
     * @param name The name of the event.
     */
    registerEvent(name) {
        this.events[name] = new Event(name);
    }

    /**
     * Attach a listener to an event
     *
     * @param eventName The name of the event to attach to.
     * @param listener The listener to attach.
     * @param {boolean} [sync=false] Whether to run the listener synchronously or not. Defaults to async.
     * @param {boolean} [once=false] Whether to only run the listener once or not. Defaults to false.
     * @param {boolean} [final=false] Whether the listener is a final listener and will only run after all of the other listeners if the event hasn't been cancelled.
     */
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

    /**
     * Emit a named event, firing the listeners attached to it.
     *
     * @param eventName The name of the event to fire.
     * @param data The data to pass to listeners.
     */
    emit(eventName, data) {
        let event = this.events[eventName];
        if (event === null || typeof event == "undefined") {
            throw new Error("Could not emit event " + eventName + "; event does not exist.")
        }
        event.fire(data);
    }
}

module.exports.wrapper = class EventManagerWrapper {
    constructor(eventManager, allowRegister, allowEmit, allowListen) {
        this.eventManager = eventManager;
        this.allowRegister = allowRegister;
        this.allowEmit = allowEmit;
        this.allowListen = allowListen;
    }

    registerEvent(name) {
        if (this.allowRegister) {
            this.eventManager.registerEvent(name);
        }
    }

    on(eventName, listener, sync = false, once = false, final = false) {
        if (this.allowListen) {
            this.eventManager.on(eventName, listener, sync, once, final);
        }
    }

    emit(eventName, data) {
        if (this.allowEmit) {
            this.eventManager.emit(eventName, data);
        }
    }
}
