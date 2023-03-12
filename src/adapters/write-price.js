/*
  This library gets the price, in PSF tokens, required to burn in order
  for a write to be accepted by the P2WDB.
*/

// Global npm libraries
// const Wallet = require('minimal-slp-wallet/index')
const axios = require('axios')

// Local libraries
const config = require('../../config')
const WalletAdapter = require('./wallet')

// Constants
const writeTokenId = '0ac28ff1e1fa93bf734430fd151115959307cf872c6d130b308a6d29182991d8'
const MINTING_COUNCIL_ADDRESS = 'bitcoincash:qrwe6kxhvu47ve6jvgrf2d93w0q38av7s5xm9xfehr'

class WritePrice {
  constructor (localConfig = {}) {
    // Encapsulate dependencies
    // this.wallet = new Wallet(undefined, {
    //   noUpdate: true,
    //   interface: 'consumer-api',
    //   restURL: config.consumerUrl
    // })
    // this.bchjs = this.wallet.bchjs
    this.wallet = undefined // placeholder
    this.bchjs = undefined // placeholder
    this.axios = axios
    this.config = config
    this.WalletAdapter = WalletAdapter

    // state
    this.currentRate = 0.133
    this.currentRateInBch = 0.0001
    this.priceHistory = []
  }

  // Instantiate the wallet if it has not already been instantiated.
  async instanceWallet () {
    if (!this.wallet) {
      const walletAdapter = new this.WalletAdapter()

      const walletData = await walletAdapter.openWallet()
      this.wallet = await walletAdapter.instanceWalletWithoutInitialization(walletData)
      this.bchjs = this.wallet.bchjs

      return true
    }

    return false
  }

  // This function retrieves an array of costs and data from the token mutable
  // data. This is an initialization function that should be called at started,
  // and periodically every hour.
  async getCostsFromToken () {
    try {
      await this.instanceWallet()

      let mutableCid
      try {
        const tokenData = await this.wallet.getTokenData(writeTokenId)
        // console.log('tokenData: ', tokenData)

        // Remove the ipfs:// prefix.
        mutableCid = tokenData.mutableData.slice(7)
        console.log('mutableCid: ', mutableCid)
      } catch (err) {
        throw new Error(`Could not get P2WDB price from blockchain: ${err.message}`)
      }

      if (!mutableCid) throw new Error('Mutable data came back empty!')

      try {
        // Get the data from IPFS.
        const fullstackUrl = `https://p2wdb-gateway-678.fullstack.cash/ipfs/${mutableCid}/data.json`
        console.log(`fullstackUrl: ${fullstackUrl}`)
        const filecoinUrl = `https://${mutableCid}.ipfs.dweb.link/data.json`
        console.log(`filecoinUrl: ${filecoinUrl}`)

        let request
        try {
          console.log('Trying to get P2WDB write price from P2WDB pinning cluster...')
          request = await this.axios.get(fullstackUrl)
        } catch (err) {
          console.log('...P2WDB pinning cluster failed. Trying to get P2WDB write price from Filecoin...')
          request = await this.axios.get(filecoinUrl)
        }
        console.log('request.data: ', request.data)

        // const request = await this.axios.get(`https://${mutableCid}.ipfs.dweb.link/data.json`)

        // https://p2wdb-gateway-678.fullstack.cash/ipfs/bafybeiavsmo4crwvhe6vas7e5tiecsgj7yblueqdbcoeb335js3zgi7reu/data.json
        // console.log(`request.data: ${JSON.stringify(request.data, null, 2)}`)

        // Update the state with the price history array.
        // this.priceHistory = request.data.p2wdbPriceHistory
        this.priceHistory = [{ date: '06/20/2022', psfPerWrite: 0.126 }]
        console.log('this.priceHistory: ', this.priceHistory)

        return this.priceHistory
      } catch (err) {
        throw new Error('Could not retrieve price data from Filecoin.')
      }
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

        console.log('rateData: ', rateDate)
        console.log('now.getTime(): ', now.getTime())
        console.log('rateDate.getTime(): ', rateDate.getTime())

        // let rateDateDiff = bestDateDiff
        const rateDateDiff = Math.abs(now.getTime() - rateDate.getTime())
        console.log(`rateDateDiff ${i}: `, rateDateDiff)

        if (rateDateDiff < bestDateDiff) {
          bestDateDiff = rateDateDiff
          currentRate = thisRate
        }
      }
      console.log('currentRate: ', currentRate)

      // if (!currentRate) throw new Error('Could not retrieve write rate in PSF tokens.')

      // Convert the date string into a Date object.
      // currentRate.date = new Date(currentRate.date)
      currentRate.date = new Date()

      // Store the price in the state of this instance.
      this.currentRate = currentRate.psfPerWrite
      // this.currentRate = 0.1

      return currentRate.psfPerWrite
      // return this.currentRate
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

      return result.psfPerWrite
    } catch (err) {
      console.error('Error in adapters/write-price.js/getTargetCostPsf(): ', err)
      throw err
    }
  }

  // Get's the cost of PSF tokens in BCH from the PSF token liquidity app.
  // This value is used to allow users to pay in BCH, and enables the P2WDB
  // to essentailly exchange a PSF tokens for BCH, in order to write to the DB.
  async getPsfPriceInBch () {
    try {
      const response = await this.axios.get('https://psfoundation.cash/price')
      // console.log('response.data: ', response.data)

      const usdPerBch = response.data.usdPerBCH
      const usdPerToken = response.data.usdPerToken

      const bchPerToken = this.bchjs.Util.floor8(usdPerToken / usdPerBch)
      // console.log('bchPerToken: ', bchPerToken)

      return bchPerToken
    } catch (err) {
      console.error('Error in adapters/write-price.js/getPsfPrice(): ', err)
      throw err
    }
  }

  // This function calls getPsfPrice() to get the price of PSF tokens in BCH.
  // It then calculates and returns the cost to write to the P2WDB in BCH.
  // That includes a markup cost for the service of providing PSF tokens to
  // the user. The market cost is set in the config file.
  async getWriteCostInBch () {
    // For debugging. Write the current balance of the wallet and token balance.
    const bchBalance = await this.wallet.getBalance()
    console.log('App wallet BCH balance: ', bchBalance)
    const tokenBalance = await this.wallet.listTokens()
    console.log('App wallet SLP balance: ', tokenBalance)

    const bchPerToken = await this.getPsfPriceInBch()

    // Cost in BCH + markup.
    let costToUser = this.currentRate * bchPerToken * (1 + this.config.psfTradeMarkup)

    // Round to 8 decimals.
    costToUser = this.bchjs.Util.floor8(costToUser)

    // Save to state.
    this.currentRateInBch = costToUser

    return costToUser
  }

  // This function retrieves the current write price in PSF tokens, leveraging
  // PS009: https://github.com/Permissionless-Software-Foundation/specifications/blob/master/ps009-multisig-approval.md
  /*
    Below is a prototype function for finding the approval transaction from the
    Minting Council (MC) and updating the write price based on it. Here is the
    workflow that needs to be developed:

    - Get TX history for the address.
    - Retrieve TX details 20 TXIDs at a time.
    - Filter the results of each block of 20 TXIDs for an APPROVAL entry in the
      OP_RETURN. The output of this step should be an array of objects, each object
      contains the TX data, block height, of each transaction that has APPROVAL,
      sorted by block height with largest block height first.
    - Get the Update TXID from the OP_RETURN, retrieve the IPFS data from that TX.
    - Recreate the multisig wallet from the IPFS data, and verify that the input
      to the APPROVAL TX matches the multisig address.
    - Create/update a database entry of write price, so that P2WDB can look it up.
    - On subsequent startups, the P2WDB only needs to find the first APPROVAL entry
      in the TX history. If it matches the same TXID as the one in the database,
      then the verification does not need to be repeated.
  */
  async getPsfPrice2 () {
    try {
      // Get the transaction history for the Minting Council address used to set
      // the P2WDB price.
      // Note: it is assumed that tx's come in in descending order with the most
      // recent TX (largest block height) first.
      const txHistory = await this.wallet.getTransactions(MINTING_COUNCIL_ADDRESS)
      console.log('txHistory: ', JSON.stringify(txHistory, null, 2))

      // for(let i=0; i < txHistory.length; i++) {
      for (let i = 0; i < 3; i++) {
        const thisTxid = txHistory[i].tx_hash

        // Get the transaction details for this transaction.
        const txDetails = await this.wallet.getTxData([thisTxid])
        // console.log('txDetails: ', JSON.stringify(txDetails, null, 2))

        // Get the contents of the first output of the transaction.
        const scriptPubKey = txDetails[0].vout[0].scriptPubKey.asm.split(' ')

        // Skip this TX if it does not contain an OP_RETURN in the first output.
        if (!scriptPubKey[0].includes('OP_RETURN')) continue

        const approvalMsg = Buffer.from(scriptPubKey[1], 'hex').toString('ascii')
        console.log('approvalMsg: ', approvalMsg)

        // Skip this TX if the OP_RETURN does not contain the word APPROVE
        if (!approvalMsg.includes('APPROVE')) continue

        const updateTxid = Buffer.from(scriptPubKey[2], 'hex').toString('ascii')
        console.log('updateTxid: ', updateTxid)
      }
    } catch (err) {
      console.error('Error in getPsfPrice2()')
      throw err
    }
  }
}

module.exports = WritePrice
