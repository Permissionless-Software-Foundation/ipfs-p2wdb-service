import mongoose from 'mongoose'
const WritePrice = new mongoose.Schema({
  txid: { type: String, required: true },
  isApprovalTx: { type: Boolean, required: true },
  verified: { type: Boolean, required: true, default: false },
  writePrice: { type: Number, default: 0.08335233 }
})
export default mongoose.model('writePrice', WritePrice)
