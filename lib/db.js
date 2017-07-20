/**
 * Database Library (DRY)
 *
 * @author Jared Allard <jared@staymarta.com>
 * @license MIT
 * @version 1
 */

'use strict';

const arangojs = require('arangojs')
const debug    = require('debug')('nodemc:db')

/**
 * Hack to have required variables.
 * @return {undefined} throws an error.
 */
const required = () => {
  throw new Error('Missing required paramater.')
}


class DB {
  /**
   * Initialize the database
   * @param  {String} [host='arangodb']         ArangoDB Host
   * @return {Object}                           ArangoJS object.
   */
  constructor(host = 'arangodb') {
    debug('connect to', host)
    const db = this.db = arangojs(`http://${host}:8529`)
    db.useBasicAuth('root', 'supersecretpassword')
  }

  /**
   * Connect to the database and choose the db name.
   * @param  {String} [databaseName]           Database for ArangoDB to use.
   * @return {ArangoJS}                        ArangoJS object.
   */
  async connect(databaseName = required()) {
    await this.setDatabase(databaseName)
    return this.db;
  }

  /**
   * Set the database that this refers to.
   * @param {String} [db] ArangoDB Name
   */
  async setDatabase(db = required()) {
    debug('setDatabase', db)

    // try to create the database.
    try {
      await this.db.createDatabase(db)
    } catch(e) {
      debug('setDatabase', 'already exists')
    }

    this.db.useDatabase(db)
  }

  /** HIGH LEVEL **/

  /**
   * Create a new document in a collection.
   * @param  {String}  [collection]  ArangoDB Collection
   * @param  {*}       [data=null]   Data to save under key.
   * @param  {Boolean} [silent=true] Return response back?
   * @return {Undefined}             Data
   */
  async create(collection = required(), data = null, silent = true) {
    const collectionObject = await this._collection(collection)

    return await collectionObject.save(data, {
      silent: silent
    })
  }

  /**
   * Collection wrapper.
   * @param  {String}  collection ArangoDB Collection Name
   * @return {Promise}            ArangoDB collection
   */
  async _collection(collection) {
    const collectionObject = this.db.collection(collection)

    try {
      await collectionObject.create()
    } catch(e) {
      debug('create', 'collection already exists')
    }

    return collectionObject
  }

  /**
   * Check if a key already exists in a collection, i.e a username exists.
   * @param  {String} [collection] ArangoDB Collection Name
   * @param  {String} [key]        Key name
   * @param  {String} [value]      Key value
   * @return {Boolean}             Exists or not
   */
  async exists(collection = required(), key = required(), value = required()) {
    const aql = arangojs.aql;
    const collectionObject = await this._collection(collection)

    let exists = false;
    try {
      const cursor = await this.db.query(aql`
        FOR o IN ${collectionObject}
        FILTER o.${key} == ${value}
        RETURN o
      `, { count: true })

      // if we have more or equal to 1, it exists already.
      if(cursor.count >= 1) exists = true
    } catch(e) {
      debug('exists', 'error', e.message)
      exists = true
    }

    if(exists) {
      debug('exists', true)
      throw new Error('EXISTS')
    }
  }

  /**
   * Find an object by key value
   * @param  {String}  [collection] ArangoDB Collection Name
   * @param  {String}  [key]        Key to compare
   * @param  {*}       [value]      Value to compare
   * @return {Promise}              ArangoDB Cursor
   */
  async find(collection = required(), key = required(), value = required()) {
    const aql = arangojs.aql;
    const collectionObject = await this._collection(collection)

    let cursor;
    try {
      cursor = await this.db.query(aql`
        FOR o IN ${collectionObject}
        FILTER o.${key} == ${value}
        RETURN o
      `, { count: true })
    } catch(e) {
      debug('exists', 'error', e.message)
      throw new Error('QUERY_FAILED')
    }

    return cursor
  }

  /**
   * Remove a document from a collection
   * @param  {String}  [collection]     ArangoDB Collection Name
   * @param  {String}  [documentHandle] ArangoDB Document _id or _key
   * @return {Promise}                  ArangoDB#collection#remove
   */
  async delete(collection = required(), documentHandle = required()) {
    const collectionObject = await this._collection(collection)
    return await collectionObject.remove(documentHandle)
  }

  /**
   * List documents handles in a collection
   * @param  {String}  [collection] ArangoDB Collection Name
   * @return {Promise}              ArangoDB#collection#list
   */
  async list(collection = required()) {
    const collectionObject = await this._collection(collection)
    return await collectionObject.list()
  }

  /**
   * Return the database object for manual use.
   * @return {Object} ArangoDB Databae Object
   */
  get database() {
    return this.db;
  }
}

module.exports = DB;
