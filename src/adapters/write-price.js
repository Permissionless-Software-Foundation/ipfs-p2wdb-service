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

    // state
    this.currentRate = 0.133
    this.priceHistory = []
  }

  // This function retrieves an array of costs and data from the token mutable
  // data. This is an initialization function that should be called at started,
  // and periodically every hour.
  async getCostsFromToken () {
    try {
      const tokenData = await this.wallet.getTokenData(writeTokenId)
      // console.log('tokenData: ', tokenData)

      // Remove the ipfs:// prefix.
      const mutableCid = tokenData.mutableData.slice(7)
      // console.log('mutableCid: ', mutableCid)

      // Get the data from IPFS.
      const request = await this.axios.get(`https://${mutableCid}.ipfs.dweb.link/data.json`)
      // console.log(`request.data: ${JSON.stringify(request.data, null, 2)}`)

      // Update the state with the price history array.
      this.priceHistory = request.data.p2wdbPriceHistory

      return this.priceHistory
    } catch (err) {
      console.error('Error in adapters/write-price.js/getCostsFromToken()')
      throw err
    }
  }

  // This function is intended to be run after getCostsFromToken(). It gets the
  // *current* cost of a write in PSF tokens. It extracts this data from the
  // priceHistory state.
  getCurrentCostPSF () {
    try {
      if (!this.priceHistory.length) throw new Error('No price history found. Run getCostsFromToken() first.')

      const now = new Date()

      const rates = this.priceHistory
      // console.log('rates: ', rates)

      let currentRate
      let bestDateDiff = 100000000000 // Init to a large number

      // Loop through the array of rate data. Find the data that currently applies.
      for (let i = 0; i < rates.length; i++) {
        // The correct rate is the one closest to the current date.

        const thisRate = rates[i]
        const rateDate = new Date(thisRate.date)

        // let rateDateDiff = bestDateDiff
        const rateDateDiff = Math.abs(now.getTime() - rateDate.getTime())

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

      return currentRate.psfPerWrite
    } catch (err) {
      console.error('Error in adapters/write-price.js/getCurrentCost()')
      throw err
    }
  }

  // This function is intended to be run after getCostsFromToken(). It gets the
  // *historical* cost of a write in PSF tokens. It extracts this data from the
  // priceHistory state.
  getTargetCostPsf (targetDate) {
    try {
      if (!targetDate) throw new Error('targetDate input is required.')

      if (!this.priceHistory.length) throw new Error('No price history found. Run getCostsFromToken() first.')

      // Ensure the input is a Date object.
      targetDate = new Date(targetDate)

      const rates = this.priceHistory
      // console.log('rates: ', rates)

      let result
      let bestDateDiff = 100000000000 // Init to a large number

      // Loop through the array of rate data. Find the data that currently applies.
      for (let i = 0; i < rates.length; i++) {
        // The correct rate is the one closest to the current date.

        const thisRate = rates[i]
        const rateDate = new Date(thisRate.date)

        // let rateDateDiff = bestDateDiff

        const rateDateDiff = Math.abs(targetDate.getTime() - rateDate.getTime())

        // console.log(`rateDateDiff ${i}: `, rateDateDiff)

        if (rateDateDiff < bestDateDiff) {
          bestDateDiff = rateDateDiff
          result = thisRate
        }
      }
      // console.log('currentRate: ', currentRate)

      if (!result) throw new Error('Could not retrieve write rate in PSF tokens.')

      // Convert the date string into a Date object.
      // currentRate.date = new Date(currentRate.date)

      // Store the price in the state of this instance.
      // if (!targetDate) { this.currentRate = currentRate.psfPerWrite }

      return result.psfPerWrite
    } catch (err) {
      console.error('Error in adapters/write-price.js/getCurrentCost()')
      throw err
    }
  }

  // Returns the value in PSF tokens that must be burned in order for a write
  // to be accepted.
  async getWriteCostPsf (targetDate) {
    try {
      const tokenData = await this.wallet.getTokenData(writeTokenId)
      // console.log('tokenData: ', tokenData)

      // Remove the ipfs:// prefix.
      const mutableCid = tokenData.mutableData.slice(7)
      // console.log('mutableCid: ', mutableCid)

      // Get the data from IPFS.
      const request = await this.axios.get(`https://${mutableCid}.ipfs.dweb.link/data.json`)
      // console.log(`request.data: ${JSON.stringify(request.data, null, 2)}`)

      const now = new Date()

      const rates = request.data.p2wdbPriceHistory
      // console.log('rates: ', rates)

      let currentRate
      let bestDateDiff = 100000000000 // Init to a large number

      // Ensure targetDate is a Date object, if the user passed it in.
      if (targetDate) targetDate = new Date(targetDate)

      // Loop through the array of rate data. Find the data that currently applies.
      for (let i = 0; i < rates.length; i++) {
        // The correct rate is the one closest to the current date.

        const thisRate = rates[i]
        const rateDate = new Date(thisRate.date)

        let rateDateDiff = bestDateDiff
        if (targetDate) {
          rateDateDiff = Math.abs(targetDate.getTime() - rateDate.getTime())
        } else {
          rateDateDiff = Math.abs(now.getTime() - rateDate.getTime())
        }
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
      if (!targetDate) { this.currentRate = currentRate.psfPerWrite }

      return currentRate.psfPerWrite
    } catch (err) {
      console.error('Error in getWriteCost()')
      throw err
    }
  }
}

module.exports = WritePrice
