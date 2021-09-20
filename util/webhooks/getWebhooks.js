const mongoose = require('mongoose')

const config = require('../../config')

const Webhook = require('../../src/adapters/localdb/models/webhook')

async function getWebhooks () {
  // Connect to the Mongo Database.
  mongoose.Promise = global.Promise
  mongoose.set('useCreateIndex', true) // Stop deprecation warning.
  await mongoose.connect(config.database, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })

  const webhooks = await Webhook.find({})
  console.log(`webhooks: ${JSON.stringify(webhooks, null, 2)}`)

  mongoose.connection.close()
}
getWebhooks()
