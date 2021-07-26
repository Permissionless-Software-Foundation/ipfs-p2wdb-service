/*
  This is a Class Library for an Adapter for Entry Entity. This Adapter
  interacts with the local MongoDB. It's the only file associated with the Entry
  Entity that needs to know which specific database is being used.
*/

const KeyValue = require('../localdb/models/key-value')

class EntryAdapter {
  constructor (localConfig = {}) {
    // Encapsulate dependencies.
    this.KeyValue = KeyValue
  }

  // Check to see if an entry already exists in the local database.
  // Returns true if the entry exists. Returns false if not.
  async doesEntryExist (entry) {
    try {
      if (!entry || typeof entry !== 'object') {
        throw new Error('entry object is required')
      }

      if (!entry.key || typeof entry.key !== 'string') {
        throw new Error('property "key" must be a string')
      }

      const key = entry.key
      const result = await this.KeyValue.find({ key })

      if (result.length > 0) return true

      return false
    } catch (err) {
      console.error('Error in doesEntryExist()')
      throw err
    }
  }

  // Insert a new entry into the local MongoDB database.
  async insert (entry) {
    try {
      if (!entry || typeof entry !== 'object') {
        throw new Error('entry object is required')
      }

      if (!entry.key || typeof entry.key !== 'string') {
        throw new Error('property "key" must be a string')
      }

      console.log(`entry: ${JSON.stringify(entry, null, 2)}`)

      const newKeyValue = new this.KeyValue(entry)
      await newKeyValue.save()

      console.log('newKeyValue: ', newKeyValue)

      return newKeyValue._id.toString()
    } catch (err) {
      console.error('Error in local-db.js/insert()')
      throw err
    }
  }
}

module.exports = EntryAdapter
