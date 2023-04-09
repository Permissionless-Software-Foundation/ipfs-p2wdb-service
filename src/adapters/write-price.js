/*
  This library gets the price, in PSF tokens, required to burn in order
  for a write to be accepted by the P2WDB.
*/

// Global npm libraries
// const Wallet = require('minimal-slp-wallet/index')
const axios = require('axios')
// const bitcore = require('bitcore-lib-cash')
const bitcore = null
const MultisigApproval = require('psf-multisig-approval')

// Local libraries
const config = require('../../config')
const WalletAdapter = require('./wallet')
const WritePriceModel = require('./localdb/models/write-price')

const writeTokenId = '0ac28ff1e1fa93bf734430fd151115959307cf872c6d130b308a6d29182991d8'

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
    this.ps009 = null // placeholder
    this.axios = axios
    this.config = config
    this.WalletAdapter = WalletAdapter
    this.WritePriceModel = WritePriceModel
    this.bitcore = bitcore

    // state
    this.currentRate = 0.133
    this.currentRateInBch = 0.0001
    this.priceHistory = []
    this.filterTxids = [] // Tracks invalid approval TXs
  }

  // Instantiate the wallet if it has not already been instantiated.
  async instanceWallet () {
    if (!this.wallet) {
      const walletAdapter = new this.WalletAdapter()

      const walletData = await walletAdapter.openWallet()
      this.wallet = await walletAdapter.instanceWalletWithoutInitialization(walletData)
      this.bchjs = this.wallet.bchjs
      this.ps009 = new MultisigApproval({ wallet: this.wallet })

      return true
    }

    return false
  }

  // This function retrieves an array of costs and data from the token mutable
  // data. This is an initialization function that should be called at start,
  // and periodically refreshed every hour.
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

  // Get the write price set by the PSF Minting Council.
  // This function assumes that transaction history is retrieved from the Cash
  // Stack is sorted in descending order with the biggest (newest) block
  // in the first element in the transaction history array.
  async getMcWritePrice () {
    // Hard codeded value. 04/08/23
    // This value is returned if there are any issues returning the write price.
    // It should be higher than actual fee, so that any writes will propegate to
    // the P2WDB nodes that successfully retrieved the current write price.
    let writePrice = 0.2

    try {
      const WRITE_PRICE_ADDR = 'bitcoincash:qrwe6kxhvu47ve6jvgrf2d93w0q38av7s5xm9xfehr'

      // Instance the wallet.
      // await this.instanceWallet()
      if (!this.wallet) {
        throw new Error('Call instanceWallet() before calling this function')
      }

      // Find the PS009 approval transaction the addresses tx history.
      console.log('Searching blockchain for updated write price...')
      const approvalObj = await this.ps009.getApprovalTx({
        address: WRITE_PRICE_ADDR,
        filterTxids: this.filterTxids
      })
      console.log('approvalObj: ', JSON.stringify(approvalObj, null, 2))

      // Throw an error if no approval transaction can be found in the
      // transaction history.
      if (approvalObj === null) {
        throw new Error(`APPROVAL transaction could not be found in the TX history of ${WRITE_PRICE_ADDR}. Can not reach consensus on write price.`)
      }

      const { approvalTxid, updateTxid } = approvalObj

      const writePriceModel = await this.WritePriceModel.findOne({ txid: approvalTxid })
      console.log('writePriceModel: ', writePriceModel)

      // If this approval TX is not in the database, then validate it.
      if (!writePriceModel) {
        console.log(`New approval txid found (${approvalTxid}), validating...`)

        // Get the CID from the update transaction.
        const updateObj = await this.ps009.getUpdateTx({ txid: updateTxid })
        console.log(`updateObj: ${JSON.stringify(updateObj, null, 2)}`)
        const { cid } = updateObj

        // Resolve the CID into JSON data from the IPFS gateway.
        const updateData = await this.ps009.getCidData({ cid })
        console.log(`updateData: ${JSON.stringify(updateData, null, 2)}`)

        // Validate the approval transaction
        const approvalIsValid = await this.ps009.validateApproval({
          approvalObj,
          updateObj,
          updateData
        })

        if (approvalIsValid) {
          console.log(`Approval TXID validated. Adding to database: ${approvalTxid}`)

          // If the validation passes, then save the transaction to the database,
          // so the expensive validation process does not need to be repeated.
          const newTx = new this.WritePriceModel({
            txid: approvalTxid,
            isApprovalTx: true,
            verified: true,
            writePrice: updateData.p2wdbWritePrice
          })
          await newTx.save()

          // Return the write price from the update data.
          writePrice = updateData.p2wdbWritePrice
        } else {
          // Approval transaction failed validation.

          console.log(`Approval TXID was found to be invalid: ${approvalTxid}`)

          // Add this invalid TXID to the filter array so that it is skipped.
          this.filterTxids.push(approvalTxid)

          // Continue looking for the correct approval transaction by recursivly
          // calling this function.
          writePrice = await this.getMcWritePrice()
        }
      } else {
        console.log('Previously validated approval transaction retrieved from database.')

        writePrice = writePriceModel.writePrice
      }
    } catch (err) {
      console.error('Error in getMcWritePrice(): ', err)
      console.log(`Using hard-coded, safety value of ${writePrice} PSF tokens per write.`)
    }

    return writePrice
  }
}

module.exports = WritePrice
