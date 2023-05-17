import Users from './models/users.js'
import BchPayment from './models/bch-payment.js'
class LocalDB {
  constructor () {
    // Encapsulate dependencies
    this.Users = Users
    this.BchPayment = BchPayment
  }
}
export default LocalDB
