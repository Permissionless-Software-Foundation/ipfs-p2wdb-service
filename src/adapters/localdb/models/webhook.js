/*
  MongoDB model for a webhook.
*/

const mongoose = require('mongoose')

const Webhook = new mongoose.Schema({
  url: { type: String, required: true },
  appId: { type: String, required: true }
})

module.exports = mongoose.model('webhook', Webhook)
