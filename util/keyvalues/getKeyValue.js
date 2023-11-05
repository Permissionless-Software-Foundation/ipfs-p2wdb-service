/*
  Get a single key-value entry
*/

// Global npm libraries
import mongoose from 'mongoose'

// Local libraries
import config from '../../config/index.js'
import KeyValue from '../../src/adapters/localdb/models/key-value.js'
// import JsonFiles from '../../src/adapters/json-files.js'

async function getTicket () {
  // Connect to the Mongo Database.
  mongoose.Promise = global.Promise
  mongoose.set('useCreateIndex', true) // Stop deprecation warning.
  console.log('Using this database connection string: ', config.database)
  await mongoose.connect(config.database, { useNewUrlParser: true, useUnifiedTopology: true })

  // const mongoConnectStr = `mongodb://localhost:${5666}/p2wdb-service-prod`
  // await mongoose.connect(mongoConnectStr, { useNewUrlParser: true, useUnifiedTopology: true })

  const txid = ''

  const entry = await KeyValue.find({ key: txid })

  console.log(`entry: ${JSON.stringify(entry, null, 2)}`)

  mongoose.connection.close()

  // const now = new Date()
  // const filename = `p2wdb-entries-${now.toISOString()}.json`
  // const jsonFiles = new JsonFiles()
  // await jsonFiles.writeJSON(entries, filename)
  // console.log('JSON file of entries have been written to disk.')
}
getTicket()
