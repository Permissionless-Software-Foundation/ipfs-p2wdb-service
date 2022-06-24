/*
  This library gets the price, in PSF tokens, required to burn in order
  for a write to be accepted by the P2WDB.
*/

// Global npm libraries
const Wallet = require('minimal-slp-wallet/index')

// Local libraries
const config = require('../../config')

const writeTokenId = '0ac28ff1e1fa93bf734430fd151115959307cf872c6d130b308a6d29182991d8'

class WritePrice {
  constructor (localConfig = {}) {
    // Encapsulate dependencies
    this.wallet = new Wallet(undefined, {
      noUpdate: true,
      interface: 'consumer-api',
      restURL: config.consumerUrl
    })
    this.bchjs = this.wallet.bchjs
  }

  // Returns the value in PSF tokens that must be burned in order for a write
  // to be accepted.
  async getWriteCost () {
    try {
      const tokenData = await this.wallet.getTokenData(writeTokenId)
      console.log('tokenData: ', tokenData)
    } catch (err) {
      console.error('Error in getWriteCost()')
      throw err
    }
  }
}

module.exports = WritePrice
