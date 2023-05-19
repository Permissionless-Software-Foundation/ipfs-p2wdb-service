/*
  Database model for pre-burned tickets.
*/

import mongoose from 'mongoose'

const Ticket = new mongoose.Schema({
  txid: { type: String, required: true },
  signature: { type: String, required: true },
  message: { type: String, required: true },
  timestamp: { type: String },
  localTimeStamp: { type: String }
})

export default mongoose.model('ticket', Ticket)
