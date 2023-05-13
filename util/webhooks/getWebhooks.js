import mongoose from 'mongoose'
import config from '../../config/index.js'
import Webhook from '../../src/adapters/localdb/models/webhook.js'
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
