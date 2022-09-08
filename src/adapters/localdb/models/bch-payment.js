/*
  This model is used to track BCH Payments for writing to the P2WDB.
*/

import mongoose from 'mongoose'

const BchPayment = new mongoose.Schema({
  address: { type: String, required: true },
  bchCost: { type: String, required: true },
  timeCreated: { type: String },
  hdIndex: { type: String, required: true }
})

export default mongoose.model('bchPayment', BchPayment)
