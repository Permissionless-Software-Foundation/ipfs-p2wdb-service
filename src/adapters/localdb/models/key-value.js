/*
  MongoDB model for the key-value store data that is syndicated via the OrbitDB.
  Each entry is duplicated in each DB. Retrieving each validated entry from
  MongoDB is much faster than validating each entry in the OrbitDB against the
  blockchain when the app is started.
*/

const mongoose = require('mongoose')
// const config = require('../../config')

const KeyValue = new mongoose.Schema({
  hash: { type: String },
  key: { type: String }, // BCH TXID
  value: { type: Object },
  isValid: { type: Boolean, default: false },
  appId: { type: String, default: '' }
})

// export default mongoose.model('user', User)
module.exports = mongoose.model('keyvalue', KeyValue)
