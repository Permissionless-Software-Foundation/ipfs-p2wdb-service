/*
  This is the Class Library for the read-entry use-cases. This is when a user
  of this service wants to read an Entry or Entries from the database.
*/
// const DBEntry = require('../entities/db-entry')
// let _this
class ReadEntry {
  constructor (localConfig = {}) {
    if (!localConfig.p2wdbAdapter) {
      throw new Error('p2wdb instance must be included when instantiating ReadEntry')
    }
    this.p2wdbAdapter = localConfig.p2wdbAdapter
    // _this = this
  }

  // Read all entries in the P2WDB.
  async readAllEntries (page) {
    try {
      const data = await this.p2wdbAdapter.readAll(page)
      return data
    } catch (err) {
      console.error('Error in readAllEntries()')
      throw err
    }
  }

  async readByHash (hash) {
    try {
      const data = await this.p2wdbAdapter.readByHash(hash)
      // Throw a 404 error if the data isn't found.
      if (!data) {
        const err = new Error('Hash not found')
        err.status = 404
        throw err
      }
      return data
    } catch (err) {
      console.error('Error in readByHash()')
      throw err
    }
  }

  async readByTxid (txid) {
    try {
      const data = await this.p2wdbAdapter.readByTxid(txid)
      // Throw a 404 error if the data isn't found.
      if (!data) {
        const err = new Error('txid not found')
        err.status = 404
        throw err
      }
      return data
    } catch (err) {
      console.error('Error in readByTxid()')
      throw err
    }
  }

  async readByAppId (appId, page) {
    try {
      const data = await this.p2wdbAdapter.readByAppId(appId, page)
      return data
    } catch (err) {
      console.error('Error in readByAppId()')
      throw err
    }
  }
}
export default ReadEntry
