/*
  This library encapsulates code concerned with MongoDB and Mongoose models.
*/

// Load Mongoose models.
const Users = require('./models/users')
const BchPayment = require('./models/bch-payment')

class LocalDB {
  constructor () {
    // Encapsulate dependencies
    this.Users = Users
    this.BchPayment = BchPayment
  }
}

module.exports = LocalDB
