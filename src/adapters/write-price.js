/*
  This library gets the price, in PSF tokens, required to burn in order
  for a write to be accepted by the P2WDB.
*/

// Global npm libraries
const Wallet = require('minimal-slp-wallet/index')
const axios = require('axios')

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
    this.axios = axios
    this.config = config
  }

  // Returns the value in PSF tokens that must be burned in order for a write
  // to be accepted.
  async getWriteCost () {
    try {
      const tokenData = await this.wallet.getTokenData(writeTokenId)
      // console.log('tokenData: ', tokenData)

      const mutableCid = tokenData.mutableData.slice(7)
      // console.log('mutableCid: ', mutableCid)

      const request = await this.axios.get(`https://${mutableCid}.ipfs.dweb.link/data.json`)
      // console.log(`request.data: ${JSON.stringify(request.data, null, 2)}`)

      const now = new Date()

      const rates = request.data.p2wdbPriceHistory
      // console.log('rates: ', rates)

      let currentRate
      let bestDateDiff = 100000000000 // Init to a large number

      // Loop through the array of rate data. Find the data that currently applies.
      for (let i = 0; i < rates.length; i++) {
        // The correct rate is the one closest to the current date.

        const thisRate = rates[i]
        const rateDate = new Date(thisRate.date)

        const rateDateDiff = now.getTime() - rateDate.getTime()
        // console.log(`rateDateDiff ${i}: `, rateDateDiff)

        if (rateDateDiff < bestDateDiff) {
          bestDateDiff = rateDateDiff
          currentRate = thisRate
        }
      }
      // console.log('currentRate: ', currentRate)

      if (!currentRate) throw new Error('Could not retrieve write rate in PSF tokens.')

      // Convert the date string into a Date object.
      currentRate.date = new Date(currentRate.date)

      // Store the price in the state of this instance.
      this.currentRate = currentRate.psfPerWrite

      return currentRate
    } catch (err) {
      console.error('Error in getWriteCost()')
      throw err
    }
  }
}

module.exports = WritePrice
