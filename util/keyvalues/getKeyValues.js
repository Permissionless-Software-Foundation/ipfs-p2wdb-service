/*
  Get all key-value pairs in the database. This is a record of all the validated
  P2WDB entries that have been validated by this instance.
*/

import mongoose from 'mongoose'
// import config from '../../config/index.js'
import KeyValue from '../../src/adapters/localdb/models/key-value.js'
import JsonFiles from '../../src/adapters/json-files.js'

async function getTickets () {
  // Connect to the Mongo Database.
  mongoose.Promise = global.Promise
  mongoose.set('useCreateIndex', true) // Stop deprecation warning.
  // await mongoose.connect(config.database, { useNewUrlParser: true, useUnifiedTopology: true })
  const mongoConnectStr = `mongodb://localhost:${5666}/p2wdb-service-prod`
  await mongoose.connect(mongoConnectStr, { useNewUrlParser: true, useUnifiedTopology: true })

  const entries = await KeyValue.find({})

  console.log(`entries: ${JSON.stringify(entries, null, 2)}`)
  console.log(`There are ${entries.length} entries`)

  mongoose.connection.close()

  const now = new Date()
  const filename = `p2wdb-entries-${now.toISOString()}.json`
  const jsonFiles = new JsonFiles()
  await jsonFiles.writeJSON(entries, filename)
  console.log('JSON file of entries have been written to disk.')
}
getTickets()
