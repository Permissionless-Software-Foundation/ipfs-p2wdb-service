/*
  MongoDB model for a webhook.
*/

import mongoose from 'mongoose'

const Webhook = new mongoose.Schema({
  url: { type: String, required: true },
  appId: { type: String, required: true }
})

export default mongoose.model('webhook', Webhook)
