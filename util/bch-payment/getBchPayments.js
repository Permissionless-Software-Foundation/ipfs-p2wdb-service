const mongoose = require('mongoose')

const config = require('../../config')

const BchPayment = require('../../src/adapters/localdb/models/bch-payment')

async function getBchPayments () {
  // Connect to the Mongo Database.
  mongoose.Promise = global.Promise
  mongoose.set('useCreateIndex', true) // Stop deprecation warning.
  await mongoose.connect(
    config.database,
    { useNewUrlParser: true, useUnifiedTopology: true }
  )

  const bchPayments = await BchPayment.find({})
  console.log(`payment entries: ${JSON.stringify(bchPayments, null, 2)}`)

  mongoose.connection.close()
}
getBchPayments()
