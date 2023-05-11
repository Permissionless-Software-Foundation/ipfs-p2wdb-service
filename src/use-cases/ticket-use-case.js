/*
  This library contains business logic for managing pre-burned tickets.

  This ticket feature is enabled via the config file. If enabled, this feature
  uses index-1 of the HD wallet to manage tickets. This address requires a
  working balance of BCH and PSF tokens, in order to generate tickets.

  This library maintains queue (array) of pre-burned tickets. When one is
  consumed, it will generate a second one.
*/

class TickeUseCases {
  constructor (localConfig = {}) {
    // console.log('User localConfig: ', localConfig)
    this.adapters = localConfig.adapters
    if (!this.adapters) {
      throw new Error(
        'Instance of adapters must be passed in when instantiating Ticket Use Cases library.'
      )
    }

    // Encapsulate dependencies
    // this.UserEntity = new UserEntity()
    // this.UserModel = this.adapters.localdb.Users
  }

  // Initialize the library and the ticket queue.
  async start () {
    try {
      console.log('hello world')
    } catch (err) {
      console.error('Error in ticket-use-cases.js/start()')
      throw err
    }
  }
}

module.exports = TickeUseCases
