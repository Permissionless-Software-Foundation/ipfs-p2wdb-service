/*
  This library contains business logic for managing pre-burned tickets.

  This ticket feature is enabled via the config file. If enabled, this feature
  uses index-1 of the HD wallet to manage tickets. This address requires a
  working balance of BCH and PSF tokens, in order to generate tickets.

  This library maintains queue (array) of pre-burned tickets. When one is
  consumed, it will generate a second one.
*/

// Set the maximum number of tickets that are held in the queue.
// const MAX_TICKETS = 2

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

    // State
    this.state = {

    }
  }

  // Initialize the library and the ticket queue.
  async start () {
    try {
      console.log('Ticket Use Cases have started.')

      // Create a wallet based on the keypair from HD index 1
      const keyPair = await this.adapters.wallet.getKeyPair(1)
      this.wallet = await this.adapters.ticket.instanceTicketWallet(keyPair)
      console.log(`Ticket USE Case this.wallet.walletInfo: ${JSON.stringify(this.wallet.walletInfo, null, 2)}`)

      // Check that the wallet has a balance of BCH and PSF tokens.

      // Check the transaction history of the address to find any existing tickets.

      // If less than the max tickets are found, generate new tickets.
    } catch (err) {
      console.error('Error in ticket-use-cases.js/start()')
      throw err
    }
  }
}

module.exports = TickeUseCases
