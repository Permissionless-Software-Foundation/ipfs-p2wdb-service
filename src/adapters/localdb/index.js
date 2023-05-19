/*
  Load the database models into the adapters object.
*/

import Users from './models/users.js'
import BchPayment from './models/bch-payment.js'
import Tickets from './models/tickets.js'

class LocalDB {
  constructor () {
    // Encapsulate dependencies
    this.Users = Users
    this.BchPayment = BchPayment
    this.Tickets = Tickets
  }
}

export default LocalDB
