/*
  This library gets the price, in PSF tokens, required to burn in order
  for a write to be accepted by the P2WDB.
*/

// Global npm libraries
// const Wallet = require('minimal-slp-wallet/index')
const axios = require('axios')
const bitcore = require('bitcore-lib-cash')

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
    this.axios = axios
    this.config = config
    this.WalletAdapter = WalletAdapter
    this.WritePriceModel = WritePriceModel
    this.bitcore = bitcore

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
    // Hard codeded value. 04/04/23
    // This value is returned if there are any issues returning the write price.
    // It should be higher than actual fee, so that any writes will propegate to
    // the P2WDB nodes that successfully retrieved the current write price.
    let writePrice = 0.2

    try {
      const WRITE_PRICE_ADDR = 'bitcoincash:qrwe6kxhvu47ve6jvgrf2d93w0q38av7s5xm9xfehr'

      // Instance the wallet.
      await this.instanceWallet()

      const txHistory = await this.wallet.getTransactions(WRITE_PRICE_ADDR)
      console.log('txHistory: ', JSON.stringify(txHistory, null, 2))

      // Loop through the transaction history
      for (let i = 0; i < txHistory.length; i++) {
        const thisTxid = txHistory[i]

        // const { height, tx_hash } = thisTxid
        const height = thisTxid.height
        const txHash = thisTxid.tx_hash

        const writePriceModel = await this.WritePriceModel.findOne({ txid: txHash })
        console.log('writePriceModel: ', writePriceModel)

        // If this TX is not in the database, then download and analyze it.
        if (!writePriceModel) {
          // Get the transaction details for the transaction
          const txDetails = await this.wallet.getTxData([txHash])
          console.log('txDetails: ', JSON.stringify(txDetails, null, 2))
          console.log(`txid: ${txHash}`)

          // If the first output is no an OP_RETURN, then the tx can be discarded.
          if (!txDetails[0].vout[0].scriptPubKey.asm.includes('OP_RETURN')) {
            const newTx = new this.WritePriceModel({
              txid: txHash,
              isApprovalTx: false,
              blockHeight: height
            })
            await newTx.save()
          }

          // convert the asm field into sections
          const asmSections = txDetails[0].vout[0].scriptPubKey.asm.split(' ')
          console.log('asmSections: ', asmSections)

          // Analyze the second part (the first part that is not OP_RETURN)
          const part1 = Buffer.from(asmSections[1], 'hex').toString('ascii')
          console.log('part1: ', part1)

          if (part1.includes('APPROVE')) {
            console.log('Approval transaction detected')
            const updateTxid = Buffer.from(asmSections[2], 'hex').toString('ascii')

            writePrice = await this.validateApprovalTx({ approvalTxDetails: txDetails[0], updateTxid })

            const newTx = new this.WritePriceModel({
              txid: txHash,
              isApprovalTx: true,
              blockHeight: height,
              verified: true
            })
            await newTx.save()

            break
          } else {
            const newTx = new this.WritePriceModel({
              txid: txHash,
              isApprovalTx: false,
              blockHeight: height
            })
            await newTx.save()
          }
        } else {
          if (writePriceModel.isApprovalTx && writePriceModel.verified) {
            writePrice = writePriceModel.writePrice

            break
          }
        }
      }
    } catch (err) {
      console.error('Error in getMcWritePrice(): ', err)
      throw err
    }

    return writePrice
  }

  // Validate an approval transaction.
  // This function retrieves the 'Update' TX that is referenced in the approval
  // transaction. It then retrieves the JSON data referenced in that update
  // transaction from IPFS. It then uses the data in that JSON file to validate
  // that the approval TX was indeed approved by the minting council.
  async validateApprovalTx (inObj = {}) {
    try {
      const { approvalTxDetails, updateTxid } = inObj
      // console.log(`approvalTxDetails: ${JSON.stringify(approvalTxDetails, null, 2)}`)
      // console.log(`updateTxid: ${JSON.stringify(updateTxid, null, 2)}`)

      // Get the validation TX data from the approval TX
      const validationTxData = await this.wallet.getTxData([updateTxid])
      // console.log(`validationTxData: ${JSON.stringify(validationTxData, null, 2)}`)

      const asmSections = validationTxData[0].vout[0].scriptPubKey.asm.split(' ')
      const jsonStr = Buffer.from(asmSections[2], 'hex').toString('ascii')
      // console.log('jsonStr: ', jsonStr)
      const jsonData = JSON.parse(jsonStr)
      const cid = jsonData.cid

      // Download the update JSON data from the P2WDB pinning cluster
      const validationData = await this.axios.get(`${this.config.ipfsGateway}${cid}/data.json`)
      // console.log('validationData.data: ', validationData.data)

      const mcAddr = this.verifyMcData(validationData.data)
      // console.log('mcAddr: ', mcAddr)

      const writePrice = validationData.data.p2wdbWritePrice

      const onChainMcAddr = approvalTxDetails.vin[0].address

      if (mcAddr !== onChainMcAddr) {
        throw new Error(`On-chain Minting Council address of ${onChainMcAddr} does not match the calculated address ${mcAddr} from the update transaction.`)
      }

      return writePrice
    } catch (err) {
      console.error('Error in validateApprovalTx(): ', err)
      throw err
    }
  }

  // This function validates the JSON data downloaded from IPFS. It uses this
  // data to construct the Minting Council multisig address. It then returns
  // that address. If the address matches the on-chain addresses that generated
  // the approval transaction, then the app has proven that the approval tx
  // was legitimately generated by the Minting Council.
  verifyMcData (jsonData) {
    try {
      const pubKeys = jsonData.walletObj.publicKeys
      const requiredSigners = jsonData.walletObj.requiredSigners
      const multisigAddr = jsonData.multisigAddr

      // TODO: Rather than assuming the pubkeys are accruate, the pubkeys should
      // be retrieved from each NFT listed in the JSON data. Since the NFTs can
      // move around, the pubkey can change. But most should resolve as long as
      // the validation happens within a month of the approve transaction happening.

      // Recreate the multisig address from the public keys
      const msAddr = new this.bitcore.Address(pubKeys, requiredSigners).toString()
      console.log('msAddr: ', msAddr)

      if (msAddr !== multisigAddr) {
        throw new Error('Write price validation: Calculated multisig address does not match the address from downloaded data.')
      }

      return msAddr
    } catch (err) {
      console.error('Error in verifyMcData(): ', err)
      throw err
    }
  }
}

module.exports = WritePrice
