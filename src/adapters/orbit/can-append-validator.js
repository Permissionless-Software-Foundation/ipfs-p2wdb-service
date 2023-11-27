/*
  The primary function in this library is canAppend(), which returns true or
  false. It evaluates an incoming write value to see if it provides adaquate
  proof-of-burn in order to be able to write to the P2WDB.

  This library is consumed by pay-to-write-access.controller.js
*/

// Local libraries
import config from '../../../config/index.js'
import KeyValue from '../localdb/models/key-value.js'
import RetryQueue from './retry-queue.js'
import validationEvent from './validation-event.js'

class P2WCanAppend {
  constructor (localConfig = {}) {
    // Input validation for instantiating the library
    if (!localConfig.wallet) {
      throw new Error('Instance of wallet required when instantiating can-append-validator.js')
    }
    this.wallet = localConfig.wallet
    if (!localConfig.writePrice) {
      throw new Error('PSF Write price required when instantiating can-append-validator.js')
    }
    this.writePrice = localConfig.writePrice

    // Encapsulate dependencies
    this.config = config
    this.KeyValue = KeyValue
    this.bchjs = this.wallet.bchWallet.bchjs
    this.retryQueue = new RetryQueue({ bchjs: this.bchjs })
    this.validationEvent = validationEvent

    // Bind 'this' object to all subfunctions.
    this.canAppend = this.canAppend.bind(this)
    this.validateEntry = this.validateEntry.bind(this)
    this.checkDate = this.checkDate.bind(this)
    this.validateAgainstBlockchain = this.validateAgainstBlockchain.bind(this)
    this._validateSignature = this._validateSignature.bind(this)
    this._validateTx = this._validateTx.bind(this)
    this.getTokenQtyDiff = this.getTokenQtyDiff.bind(this)
    this.matchErrorMsg = this.matchErrorMsg.bind(this)
    this.markInvalid = this.markInvalid.bind(this)
    this.markValid = this.markValid.bind(this)
  }

  // This function validates an entry to determine if it should be added to the
  // P2WDB OrbitDB or not. It return true or false.
  async canAppend (entry) {
    try {
      // Input validation
      this.validateEntry(entry)

      // Initialize variables
      let validTx = false
      const txid = entry.payload.key
      const message = entry.payload.value.message
      const signature = entry.payload.value.signature
      const dbData = entry.payload.value.data
      console.log(`payload: ${JSON.stringify(entry.payload, null, 2)}`)

      // Throw an error if the message is bigger than 10 KB.
      if (dbData.length > this.config.maxDataSize) {
        console.error(`TXID ${txid} not allowed to write to DB because message exceeds max size of ${this.config.maxDataSize}`)
        return false
      }

      // Fast validation: validate the TXID if it already exists in MongoDB.
      const mongoRes = await this.KeyValue.find({ key: txid })
      if (mongoRes.length > 0) {
        console.log('mongoRes: ', mongoRes)
        console.log('Result retrieved from Mongo database.')

        // Return the previously saved validation result.
        const isValid = mongoRes[0].isValid
        return isValid
      }

      // Display the entry if it did not pass a check of the MongoDB.
      console.log('canAppend entry: ', entry)

      // Ensure the entry is less than a year old.
      const isAYearOld = this.checkDate(entry.payload)
      if (isAYearOld) {
        console.log('Entry is older than a year, ignoring.')
        return false
      }

      // If this is recent transaction, then wait a few seconds to ensure the SLP
      // indexer has time to process it.
      // const entryDate = new Date(entry.payload.value.timestamp)
      const timestamp = entry.payload.value.timestamp
      console.log(`timestamp: ${timestamp}`)
      const now = new Date()
      const tenSeconds = 10000
      if (timestamp > now.getTime() - tenSeconds) {
        await this.bchjs.Util.sleep(5000)
      }

      // Validate the TXID against the blockchain; use a queue with automatic retry.
      // New nodes connecting will attempt to rapidly validate a lot of entries.
      // A promise-based queue allows this to happen while respecting rate-limits
      // of the blockchain service provider.
      const inputObj = { txid, signature, message, entry }
      validTx = await this.retryQueue.addToQueue(this.validateAgainstBlockchain, inputObj)
      console.log(`Validation for TXID ${txid} completed. Result: ${validTx}`)

      // If the entry passed validation, trigger an event.
      // But only if the entry has a 'hash' value.
      // - has hash value: entry is being replicated from a peer
      // - no hash value: entry came in from a user of this node via REST or RPC.
      if (validTx && entry.hash) {
        inputObj.data = dbData
        inputObj.hash = entry.hash
        console.log('inputObj: ', inputObj)
        this.validationEvent.emit('ValidationSucceeded', inputObj)
      }

      return validTx
    } catch (err) {
      console.log('Error in can-append-validator.js/canAppend(). Returning false. Error: \n', err)
      return false
    }
  }

  // Validate the entry. This function tests the entry data to ensure it has the
  // required properties of key, value.message, value.signature, and value.data
  validateEntry (entry) {
    if (!entry.payload.key) throw new Error('Entry has no valid payload.key property.')
    if (!entry.payload.value) throw new Error('Entry has no valid payload.value property.')
    if (!entry.payload.value.message) throw new Error('Entry has no valid payload.value.message property.')
    if (!entry.payload.value.signature) throw new Error('Entry has no valid payload.value.signature property.')
    if (!entry.payload.value.data) throw new Error('Entry has no valid payload.key.value.data property.')

    return true
  }

  // Checks the date of the entry. Returns true if it is older than a year,
  // otherwise it returns false.
  checkDate (payload) {
    const now = new Date()
    const oneYear = 60000 * 60 * 24 * 365
    const oneYearAgo = now.getTime() - oneYear
    const timestamp = payload.value.timestamp
    if (timestamp < oneYearAgo) { return true }
    return false
  }

  // This is an async wrapper function. It wraps all other logic for validating
  // a new entry and it's proof-of-burn against the blockchain.
  async validateAgainstBlockchain (inputObj) {
    console.log('Starting validateAgainstBlockchain()')

    const { txid, signature, message, entry } = inputObj

    try {
      // Input validation
      if (!inputObj || typeof inputObj !== 'object') {
        throw new Error('input must be an object')
      }
      if (!txid || typeof txid !== 'string') {
        throw new Error('txid must be a string')
      }
      if (!signature || typeof signature !== 'string') {
        throw new Error('signature must be a string')
      }
      if (!message || typeof message !== 'string') {
        throw new Error('message must be a string')
      }

      let validTx = false

      let txData = await this.wallet.bchWallet.getTxData([txid])
      // console.log(`tx data: ${JSON.stringify(tx, null, 2)}`)
      if (!txData) {
        throw new Error('Could not get transaction details from BCH service.')
      }
      txData = txData[0]

      // Validate the signature to ensure the user submitting data owns
      // the address that did the token burn.
      // This prevents a 'front running' corner case.
      const validSignature = await this._validateSignature(txData, signature, message)
      console.log('Signature is valid?: ', validSignature)
      if (!validSignature) {
        console.log(`Signature for TXID ${txData.txid} is not valid. Rejecting entry.`)
        return false
      }

      // Validate the transaction matches the burning rules.
      validTx = await this._validateTx(txData, entry)
      return validTx
    } catch (err) {
      console.error('Error in adapters/orbit/pay-to-write-access-controller.js/validateAgainstBlockchain(): ', err.message)
      // Add the invalid entry to the MongoDB if the error message matches
      // a known pattern.
      if (this.matchErrorMsg(err.message)) {
        await this.markInvalid(txid)
        return false
      }
      // Throw an error if this is not an anticipated error message.
      throw err
    }
  }

  // Validate a signed messages, to ensure the signer of the message is the owner
  // of the second output of the TX. This ensures the same user who burned the
  // tokens is the same user submitting the new DB entry. It prevents
  // 'front running', or malicous users watching the network for valid burn
  // TXs then using them to submit their own data to the DB.
  // Returns true if signature is valid. Otherwise it throws an error.
  async _validateSignature (txData, signature, message) {
    try {
      // Input validation
      if (!txData) {
        throw new Error('txData must be an object containing tx data')
      }
      if (!signature || typeof signature !== 'string') {
        throw new Error('signature must be a string')
      }
      if (!message || typeof message !== 'string') {
        throw new Error('message must be a string')
      }

      // Get the address for the second output of the TX.
      const addresses = txData.vout[1].scriptPubKey.addresses
      const address = addresses[0]
      // console.log(`address: ${address}`)
      // console.log(`signature: ${signature}`)
      // console.log(`message: ${message}`)

      // Verify the signed message is owned by the address.
      const isValid = this.bchjs.BitcoinCash.verifyMessage(address, signature, message)
      return isValid
    } catch (err) {
      console.error('Error in _validateSignature(). Invalid signature?')
      throw err
    }
  }

  // Returns true if the txid burned the minimum amount of PSF tokens.
  async _validateTx (txData, entry) {
    try {
      // console.log('_validateTx() txData: ', txData)
      // Input validation
      if (!txData) {
        throw new Error('txData must be an object containing tx data')
      }

      let isValid = false
      const isValidSLPTx = txData.isValidSlp

      // console.log(`txData: ${JSON.stringify(txData, null, 2)}`)
      console.log(`Reviewing TXID: ${txData.txid}`)

      // Return false if txid is not a valid SLP tx.
      if (!isValidSLPTx) {
        console.log(`TX ${txData.txid} is not a valid SLP transaction.`)
        return false
      }

      // Return false if tokenId does not match.
      if (txData.tokenId !== this.config.tokenId) {
        console.log(`TX ${txData.txid} does not consume a valid token.`)
        console.log('txData: ', txData)

        if (!txData.tokenId) {
          throw new Error('Transaction data does not include a token ID.')
        }
        return false
      }

      // Get the difference, or the amount of PSF tokens burned.
      let diff = await this.getTokenQtyDiff(txData)
      diff = this.bchjs.Util.floor8(diff)

      // Get the timestamp of the entry.
      let timestamp = entry.payload.value.timestamp
      timestamp = new Date(timestamp)
      console.log('timestamp: ', timestamp)

      // TODO: Try to determine timestamp from the TX. If that fails, fall back
      // to the payload timestamp.
      // Get the required burn price, based on the timestamp.
      // console.log('this._options: ', this._options)
      // const requiredPrice = this._options.writePrice.getTargetCostPsf(timestamp)

      const requiredPrice = this.writePrice.currentRate
      console.log('requiredPrice: ', requiredPrice)

      // If the difference is above a positive threshold, then it's a burn
      // transaction.
      // Give a 2% grace for rounding errors.
      const tokenQtyWithGrace = this.bchjs.Util.floor8(
        // this.config.reqTokenQty * 0.98
        // ToDo: Replace this with write-price library
        requiredPrice * 0.98)
      console.log(`Token diff: ${diff}, threshold: ${tokenQtyWithGrace}`)
      if (diff >= tokenQtyWithGrace) {
        console.log(`TX ${txData.txid} proved burn of tokens. Will be allowed to write to DB.`)
        isValid = true
      }

      return isValid
    } catch (err) {
      console.error('Error in _validateTx(): ', err.message)
      if (!err.message) { console.log('Error: ', err) }
      // Handle rate-limit error.
      if (err.error) { throw new Error(err.error) }
      // Handle nginx 429 errors.
      // try {
      //   if (err.indexOf('429 Too Many Requests') > -1) {
      //     throw new Error('nginx: 429 Too Many Requests')
      //   }
      // } catch {}
      // Throw an error rather than return false. This will pass rate-limit
      // errors to the retry logic.
      throw err
    }
  }

  // Try to match the error message to one of several known error messages.
  // Returns true if there is a match. False if no match.
  matchErrorMsg (msg) {
    if (!msg || typeof msg !== 'string') { return false }
    // Returned on forged TXID or manipulated ACL rules.
    if (msg.includes('No such mempool or blockchain transaction')) { return true }
    return false
  }

  // Add the TXID to the database, and mark it as invalid. This will prevent
  // validation spamming.
  async markInvalid (txid) {
    try {
      if (!txid || typeof txid !== 'string') {
        throw new Error('txid must be a string')
      }
      // Create a new entry in the database, to remember the TXID. Mark the
      // entry as invalid.
      const kvObj = {
        hash: '',
        key: txid,
        value: {},
        isValid: false
      }
      const keyValue = new this.KeyValue(kvObj)
      await keyValue.save()
      return keyValue
    } catch (err) {
      console.error('Error in markInvalid()')
      throw err
    }
  }

  // Add the TXID to the database, and mark it as valid. This will prevent
  // allow for fast validation for entries that have already been seen.
  async markValid (inObj = {}) {
    try {
      console.log('markValid() inObj: ', inObj)
      const { txid, signature, message, entry } = inObj

      if (!txid || typeof txid !== 'string') {
        throw new Error('txid must be a string')
      }

      // Create a new entry in the database, to remember the TXID. Mark the
      // entry as invalid.
      const kvObj = {
        hash: '',
        key: txid,
        value: {
          message,
          signature,
          data: entry
        },
        isValid: true
      }
      const keyValue = new this.KeyValue(kvObj)

      await keyValue.save()

      return keyValue
    } catch (err) {
      console.error('Error in markValid()')
      throw err
    }
  }

  // Get the differential token qty between the inputs and outputs of a tx.
  // This determins if the tx was a proper token burn.
  async getTokenQtyDiff (txInfo) {
    try {
      // Input validation
      if (!txInfo) {
        throw new Error('txInfo is required')
      }
      if (!txInfo.vin || !txInfo.vout) {
        throw new Error('txInfo must contain vin and vout array')
      }

      // Sum up all the token inputs
      let inputTokenQty = 0
      for (let i = 0; i < txInfo.vin.length; i++) {
        let tokenQty = 0
        if (!txInfo.vin[i].tokenQty) {
          tokenQty = 0
        } else {
          tokenQty = Number(txInfo.vin[i].tokenQty)
        }
        inputTokenQty += tokenQty
      }
      console.log(`inputTokenQty: ${inputTokenQty}`)

      // Sum up all the token outputs
      let outputTokenQty = 0
      for (let i = 0; i < txInfo.vout.length; i++) {
        let tokenQty = 0
        if (!txInfo.vout[i].tokenQty) {
          tokenQty = 0
        } else {
          tokenQty = Number(txInfo.vout[i].tokenQty)
        }
        outputTokenQty += tokenQty
      }
      console.log(`outputTokenQty: ${outputTokenQty}`)

      const diff = inputTokenQty - outputTokenQty
      console.log(`token difference (burn): ${diff}`)

      return diff
    } catch (err) {
      console.error('Error in getTokenQtyDiff: ', err.message)
      throw err
    }
  }

  hello () {
    console.log('hello from P2WCanAppend!')
  }
}

export default P2WCanAppend
