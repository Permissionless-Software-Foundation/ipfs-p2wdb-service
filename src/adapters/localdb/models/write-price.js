/*
  This model is used to track the write price set by the PSF Minting Council.
  This database model stores the validation data, so that this instance of the
  P2WDB only needs to validate the data once. Validation is computationally
  expensive.
*/

const mongoose = require('mongoose')

const WritePrice = new mongoose.Schema({
  txid: { type: String, required: true },
  isApprovalTx: { type: Boolean, required: true },
  verified: { type: Boolean, required: true, default: false },
  writePrice: { type: Number, default: 0.08335233 }
})

module.exports = mongoose.model('writePrice', WritePrice)
