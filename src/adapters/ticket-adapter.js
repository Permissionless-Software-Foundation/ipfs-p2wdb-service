/*
  Adapter library for generating pre-burned tickets.
*/

// Public npm libraries
import BchWallet from 'minimal-slp-wallet'

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
}

// module.exports = TicketAdapter

export default TicketAdapter
