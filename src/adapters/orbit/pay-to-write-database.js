/*
  This pay-to-write database library is forked from the keyvalue.js database
  library that ships with OrbitDB.
*/

/**
 * @namespace Databases-PayToWriteDatabase
 * @memberof module:Databases
 * @description
 * PayToWriteDatabase key-value database.
 *
 * @augments module:Databases~Database
 */
import Database from './database.js'
// import Database from '@chris.troutner/orbitdb-helia/src/database.js'

const type = 'payToWrite'

let localP2wdbCanAppend = false

/**
 * Defines an PayToWriteDatabase database.
 * @return {module:Databases.Databases-PayToWriteDatabase} A  PayToWrite function.
 * @memberof module:Databases
 */
const PayToWriteDatabase = () => async ({ ipfs, identity, address, name, access, directory, meta, headsStorage, entryStorage, indexStorage, referencesCount, syncAutomatically, onUpdate }) => {
  const database = await Database({ ipfs, identity, address, name, access, directory, meta, headsStorage, entryStorage, indexStorage, referencesCount, syncAutomatically, onUpdate })

  const { addOperation, log } = database
  console.log('--->log instantiated<---')

  if (localP2wdbCanAppend) {
    log.injectDeps(localP2wdbCanAppend)
    console.log('--->p2wdbCanAppend injected into oplog<---')
  }

  /**
   * Stores a key/value pair to the store.
   * @function
   * @param {string} key The key to store.
   * @param {*} value The value to store.
   * @return {string} The hash of the new oplog entry.
   * @memberof module:Databases.Databases-PayToWriteDatabase
   * @instance
   */
  const put = async (key, value) => {
    return addOperation({ op: 'PUT', key, value })
  }

  /**
   * Returns an empty object. Deletion is not possible.
   * @function
   * @param {string} key The key of the key/value pair to delete.
   * @memberof module:Databases.Databases-PayToWriteDatabase
   * @instance
   */
  const del = async (key) => {
    // return addOperation({ op: 'DEL', key, value: null })

    // Deleting items from the database should not be possible.
    return {}
  }

  /**
   * Gets a value from the store by key.
   * @function
   * @param {string} key The key of the value to get.
   * @return {*} The value corresponding to key or null.
   * @memberof module:Databases.Databases-PayToWriteDatabase
   * @instance
   */
  const get = async (key) => {
    for await (const entry of log.traverse()) {
      const { op, key: k, value } = entry.payload
      if (op === 'PUT' && k === key) {
        return value
      } else if (op === 'DEL' && k === key) {
        return
      }
    }
  }

  /**
   * Iterates over keyvalue pairs.
   * @function
   * @param {Object} [filters={}] Various filters to apply to the iterator.
   * @param {string} [filters.amount=-1] The number of results to fetch.
   * @yields [string, string, string] The next key/value as key/value/hash.
   * @memberof module:Databases.Databases-PayToWriteDatabase
   * @instance
   */
  const iterator = async function * ({ amount } = {}) {
    const keys = {}
    let count = 0
    for await (const entry of log.traverse()) {
      const { op, key, value } = entry.payload
      if (op === 'PUT' && !keys[key]) {
        keys[key] = true
        count++
        const hash = entry.hash
        yield { key, value, hash }
      } else if (op === 'DEL' && !keys[key]) {
        keys[key] = true
      }
      if (count >= amount) {
        break
      }
    }
  }

  /**
   * Returns all key/value pairs.
   * @function
   * @return [][string, string, string] An array of key/value pairs as
   * key/value/hash entries.
   * @memberof module:Databases.Databases-PayToWriteDatabase
   * @instance
   */
  const all = async () => {
    const values = []
    for await (const entry of iterator()) {
      values.unshift(entry)
    }
    return values
  }

  return {
    ...database,
    type,
    put,
    set: put, // Alias for put()
    del,
    get,
    iterator,
    all
  }
}

PayToWriteDatabase.type = type

PayToWriteDatabase.injectDeps = (p2wdbCanAppend) => {
  console.log('pay-to-write-database injectDeps() executed')
  localP2wdbCanAppend = p2wdbCanAppend
}

export default PayToWriteDatabase
