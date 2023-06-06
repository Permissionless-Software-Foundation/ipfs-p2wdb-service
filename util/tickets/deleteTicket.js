/*
  This script is used to delete specific problematic tickets, identified
  by their TXID.
*/

import mongoose from 'mongoose'
import config from '../../config/index.js'
import Tickets from '../../src/adapters/localdb/models/tickets.js'

const TXID = 'f5377d3fdb136ed9877c2675672820354d67ada9345708acccaf62ba6f14105e'

async function deleteTicket () {
  // Connect to the Mongo Database.
  mongoose.Promise = global.Promise
  mongoose.set('useCreateIndex', true) // Stop deprecation warning.
  await mongoose.connect(config.database, { useNewUrlParser: true, useUnifiedTopology: true })

  const ticket = await Tickets.findOne({txid: TXID})

  console.log(`ticket deleted: ${JSON.stringify(ticket, null, 2)}`)

  await ticket.remove()

  mongoose.connection.close()
}
deleteTicket()
