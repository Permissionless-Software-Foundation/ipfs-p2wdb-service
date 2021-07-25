/*
  This is the Class Library for the read-entry use-cases. This is when a user
  of this service wants to read an Entry or Entries from the database.
*/

// const DBEntry = require('../entities/db-entry')

// let _this

class ReadEntry {
  constructor (localConfig = {}) {
    if (!localConfig.p2wdbAdapter) {
      throw new Error(
        'p2wdb instance must be included when instantiating ReadEntry'
      )
    }
    this.p2wdbAdapter = localConfig.p2wdbAdapter

    // _this = this
  }

  // Read all entries in the P2WDB.
  async readAllEntries () {
    try {
      const data = await this.p2wdbAdapter.readAll()

      return data
    } catch (err) {
      console.error('Error in readAllEntries()')
      throw err
    }
  }

  async readByHash (hash) {
    try {
      const data = await this.p2wdbAdapter.readByHash(hash)

      return data
    } catch (err) {
      console.error('Error in readByHash()')
      throw err
    }
  }

  async readByTxid (txid) {
    try {
      const data = await this.p2wdbAdapter.readByTxid(txid)

      return data
    } catch (err) {
      console.error('Error in readByTxid()')
      throw err
    }
  }

  async readByAppId (appId) {
    try {
      const data = await this.p2wdbAdapter.readByAppId(appId)

      return data
    } catch (err) {
      console.error('Error in readByAppId()')
      throw err
    }
  }
}

module.exports = ReadEntry
