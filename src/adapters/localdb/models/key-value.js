import mongoose from 'mongoose'
// const config = require('../../config')
const KeyValue = new mongoose.Schema({
  hash: { type: String },
  key: { type: String },
  value: { type: Object },
  isValid: { type: Boolean, default: false },
  appId: { type: String, default: '' },
  createdAt: { type: Number, default: 0 }
})
export default mongoose.model('keyvalue', KeyValue)
