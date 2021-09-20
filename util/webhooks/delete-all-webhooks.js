const mongoose = require('mongoose')

// Force test environment
// make sure environment variable is set before this file gets called.
// see test script in package.json.
// process.env.KOA_ENV = 'test'
const config = require('../../config')

const Webhook = require('../../src/adapters/localdb/models/webhook')

async function deleteWebhook () {
  // Connect to the Mongo Database.
  mongoose.Promise = global.Promise
  mongoose.set('useCreateIndex', true) // Stop deprecation warning.
  await mongoose.connect(config.database, {
    useUnifiedTopology: true,
    useNewUrlParser: true
  })

  // Get all the users in the DB.
  const webhook = await Webhook.find({})
  // console.log(`users: ${JSON.stringify(users, null, 2)}`)

  // Delete each user.
  for (let i = 0; i < webhook.length; i++) {
    const thisWebhook = webhook[i]
    await thisWebhook.remove()
  }

  mongoose.connection.close()
}

deleteWebhook()
