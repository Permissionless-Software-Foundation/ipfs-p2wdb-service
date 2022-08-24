const mongoose = require('mongoose')

// Force test environment
// make sure environment variable is set before this file gets called.
// see test script in package.json.
// process.env.KOA_ENV = 'test'
const config = require('../../config')

const BchPayment = require('../../src/adapters/localdb/models/bch-payment')

async function deleteBchPayment () {
  // Connect to the Mongo Database.
  mongoose.Promise = global.Promise
  mongoose.set('useCreateIndex', true) // Stop deprecation warning.
  await mongoose.connect(config.database, {
    useUnifiedTopology: true,
    useNewUrlParser: true
  })

  // Get all the users in the DB.
  const bchPayments = await BchPayment.find({})
  // console.log(`users: ${JSON.stringify(users, null, 2)}`)

  // Delete each user.
  for (let i = 0; i < bchPayments.length; i++) {
    const thisPayment = bchPayments[i]
    await thisPayment.remove()
  }

  mongoose.connection.close()
}

deleteBchPayment()
