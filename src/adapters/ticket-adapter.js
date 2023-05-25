/*
  Adapter library for generating pre-burned tickets.
*/

// Public npm libraries
import BchWallet from 'minimal-slp-wallet'
import { Write } from 'p2wdb'

// Local libraries
import config from '../../config/index.js'

class TicketAdapter {
  constructor (localConfig = {}) {
    // this.wallet = localConfig.wallet
    // if (!this.wallet) {
    //   throw new Error('Instance of minimal-slp-wallet required when instantiating Ticket Adapter library.')
    // }

    // Encapsulate dependencies
    this.config = config
    this.BchWallet = BchWallet
    this.wallet = null // placeholder
    this.Write = Write
  }

  // Instance the wallet that will be used to generate tickets. This is the
  // 1-index of the HD wallet.
  async instanceTicketWallet (keyPair = {}) {
    try {
      // const { cashAddress, wif } = keyPair
      const { wif } = keyPair

      if (!wif) {
        throw new Error('wif is required to instantiate ticket wallet')
      }

      const advancedConfig = {}
      if (this.config.useFullStackCash) {
        advancedConfig.interface = 'rest-api'
        advancedConfig.restURL = this.config.apiServer
        advancedConfig.apiToken = this.config.apiToken
      } else {
        advancedConfig.interface = 'consumer-api'
        advancedConfig.restURL = this.config.consumerUrl
      }

      // Instantiate minimal-slp-wallet.
      // this.bchWallet = new this.BchWallet(walletData.mnemonic, advancedConfig)
      this.wallet = await this._instanceWallet(wif, advancedConfig)

      return this.wallet
    } catch (err) {
      console.error('Error in ticket-adapter.js/instanceTicketWallet()')
      throw err
    }
  }

  // This function is used for easier mocking of unit tests.
  async _instanceWallet (wif, config) {
    const wallet = new this.BchWallet(wif, config)
    await wallet.initialize()
    return wallet
  }

  // Create a new ticket.
  async createTicket (inObj = {}) {
    try {
      if (!this.wallet) {
        throw new Error('Wallet must be instantiated before creating tickets.')
      }

      const { TicketModel } = inObj

      // Instantiate the write library.
      const write = new this.Write({ bchWallet: this.wallet })

      // Create a ticket.
      const ticket = await write.createTicket()
      // console.log(`ticket: ${JSON.stringify(ticket, null, 2)}`)

      // Save the ticket to the database.
      const newTicket = new TicketModel(ticket)
      await newTicket.save()

      return ticket
    } catch (err) {
      console.error('Error in ticket-adapter.js/createTicket()')
      throw err
    }
  }
}

// module.exports = TicketAdapter

export default TicketAdapter
