/*
  Get all tickets in the database
*/

import mongoose from 'mongoose'
import config from '../../config/index.js'
import Tickets from '../../src/adapters/localdb/models/tickets.js'

async function getTickets () {
  // Connect to the Mongo Database.
  mongoose.Promise = global.Promise
  mongoose.set('useCreateIndex', true) // Stop deprecation warning.
  await mongoose.connect(config.database, { useNewUrlParser: true, useUnifiedTopology: true })

  const tickets = await Tickets.find({})

  console.log(`tickets: ${JSON.stringify(tickets, null, 2)}`)

  mongoose.connection.close()
}
getTickets()
