/*
  Creates an Orbit-DB Access Controller that allows anyone to write, so long
  as they can prove they have burned an SLP token.

  Most of this code is copied directly from the OrbitDB Access Controller Library (ACL):
  https://github.com/orbitdb/orbit-db-access-controllers/blob/main/src/orbitdb-access-controller.js
*/

// Public npm libraries
const AccessController = require('orbit-db-access-controllers/src/access-controller-interface')
const pMapSeries = require('p-map-series')
// const BCHJS = require('@psf/bch-js')
// const Wallet = require('minimal-slp-wallet/index')
const path = require('path')

// Local libraries
const config = require('../../../config')
const KeyValue = require('../localdb/models/key-value')
const RetryQueue = require('./retry-queue')
const validationEvent = require('./validation-event')
// const Webhook = require('./webhook')
const WalletAdapter = require('../wallet')

let _this

class PayToWriteAccessController extends AccessController {
  constructor (orbitdb, options) {
    super()
    this._orbitdb = orbitdb
    this._db = null
    this._options = options || {}
    // console.log('this._options: ', this._options)

    // State of this library
    this.isInitialized = false

    // Encapsulate dependencies
    // this.bchjs = new BCHJS()
    this.config = config
    // this.wallet = new Wallet(undefined, {
    //   noUpdate: true,
    //   interface: 'consumer-api',
    //   restURL: config.consumerUrl
    // })
    this.wallet = undefined // Placeholder
    // this.bchjs = this.wallet.bchjs
    this.bchjs = undefined // Placeholder
    this.KeyValue = KeyValue
    this.WalletAdapter = WalletAdapter

    // this.retryQueue = new RetryQueue({ bchjs: this.bchjs })
    this.retryQueue = undefined // Placeholder
    this.validationEvent = validationEvent
    // this.webhook = new Webhook()

    // this.initialize()

    _this = this
  }

  // Initialize this library by executing the async setup.
  async initialize () {
    if (!this.isInitialized) {
      await this.instanceWallet()

      this.bchjs = this.wallet.bchjs
      this.retryQueue = new RetryQueue({ bchjs: this.bchjs })

      // Signal that the library is initialized
      this.isInitialized = true

      return true
    }
  }

  // Instantiate the wallet if it has not already been instantiated.
  async instanceWallet () {
    if (!this.wallet) {
      const walletAdapter = new this.WalletAdapter()

      const walletData = await walletAdapter.openWallet()
      this.wallet = await walletAdapter.instanceWalletWithoutInitialization(walletData)

      return true
    }

    return false
  }

  // Returns the type of the access controller
  static get type () {
    return 'payToWrite'
  }

  // Returns the address of the OrbitDB used as the AC.
  // No test coverage as this is copied directly from OrbitDB ACL.
  get address () {
    return this._db.address
  }

  // No test coverage as this is copied directly from OrbitDB ACL.
  get capabilities () {
    if (this._db) {
      const capabilities = this._db.index

      const toSet = (e) => {
        const key = e[0]
        capabilities[key] = new Set([...(capabilities[key] || []), ...e[1]])
      }

      // Merge with the access controller of the database
      // and make sure all values are Sets
      Object.entries({
        ...capabilities,
        // Add the root access controller's 'write' access list
        // as admins on this controller
        ...{
          admin: new Set([
            ...(capabilities.admin || []),
            ...this._db.access.write
          ])
        }
      }).forEach(toSet)

      return capabilities
    }
    return {}
  }

  // No test coverage as this is copied directly from OrbitDB ACL.
  get (capability) {
    return this.capabilities[capability] || new Set([])
  }

  // No test coverage as this is copied directly from OrbitDB ACL.
  async close () {
    await this._db.close()
  }

  // No test coverage as this is copied directly from OrbitDB ACL.
  async load (address) {
    if (this._db) {
      await this._db.close()
    }

    // Force '<address>/_access' naming for the database
    this._db = await this._orbitdb.keyvalue(this.ensureAddress(address), {
      // use ipfs controller as a immutable "root controller"
      accessController: {
        type: 'ipfs',
        write: this._options.admin || [this._orbitdb.identity.id]
      },
      sync: true
    })

    this._db.events.on('ready', this._onUpdate.bind(this))
    this._db.events.on('write', this._onUpdate.bind(this))
    this._db.events.on('replicated', this._onUpdate.bind(this))

    await this._db.load()
  }

  // Copied from OrbitDB ACL boilerplate.
  ensureAddress (address) {
    const suffix = address.toString().split('/').pop()
    return suffix === '_access' ? address : path.join(address, '/_access')
  }

  // No test coverage as this is copied directly from OrbitDB ACL.
  async save () {
    // return the manifest data
    return {
      address: this._db.address.toString()
    }
  }

  // No test coverage as this is copied directly from OrbitDB ACL.
  async grant (capability, key) {
    // Merge current keys with the new key
    const capabilities = new Set([
      ...(this._db.get(capability) || []),
      ...[key]
    ])
    await this._db.put(capability, Array.from(capabilities.values()))
  }

  // No test coverage as this is copied directly from OrbitDB ACL.
  async revoke (capability, key) {
    const capabilities = new Set(this._db.get(capability) || [])
    capabilities.delete(key)
    if (capabilities.size > 0) {
      await this._db.put(capability, Array.from(capabilities.values()))
    } else {
      await this._db.del(capability)
    }
  }

  /* Private methods */
  // No test coverage as this is copied directly from OrbitDB ACL.
  _onUpdate () {
    this.emit('updated')
  }

  /* Factory */
  // No test coverage as this is copied directly from OrbitDB ACL.
  static async create (orbitdb, options = {}) {
    const ac = new PayToWriteAccessController(orbitdb, options)
    await ac.load(
      options.address || options.name || 'default-access-controller'
    )

    // Add write access from options
    if (options.write && !options.address) {
      await pMapSeries(options.write, async (e) => ac.grant('write', e))
    }

    return ac
  }

  // Return true if entry is allowed to be added to the database
  // This function implements a queue with retry. It will very
  // quickly exhaust the rate limits of FullStack.cash or whatever blockchain
  // service provider it's using. A retry queue allows a new node to sync
  // to the existing peer databases while respecting rate limits.
  async canAppend (entry, identityProvider) {
    try {
      // console.log('canAppend entry: ', entry)

      // Initialize the wallet if it hasn't already been done.
      await this.initialize()

      let validTx = false

      const txid = entry.payload.key
      const message = entry.payload.value.message
      const signature = entry.payload.value.signature
      const dbData = entry.payload.value.data

      // console.log(`payload: ${JSON.stringify(entry.payload, null, 2)}`)

      // Throw an error if the message is bigger than 10 KB.
      // TODO: Create a unit test for this code path.
      if (dbData.length > this.config.maxDataSize) {
        console.error(
          `TXID ${txid} not allowed to write to DB because message exceeds max size of ${this.config.maxDataSize}`
        )
        return false
      }

      // Fast validation: validate the TXID if it already exists in MongoDB.
      const mongoRes = await this.KeyValue.find({ key: txid })
      if (mongoRes.length > 0) {
        // console.log('mongoRes: ', mongoRes)
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
      validTx = await this.retryQueue.addToQueue(
        this.validateAgainstBlockchain,
        inputObj
      )
      console.log(`Validation for TXID ${txid} completed. Result: ${validTx}`)

      // If the entry passed validation, trigger an event.
      // But only if the entry has a 'hash' value.
      // - has hash value: entry is being replicated from a peer
      // - no hash value: entry came in from a user of this node via REST or RPC.
      if (validTx && entry.hash) {
        inputObj.data = dbData
        inputObj.hash = entry.hash

        this.validationEvent.emit('ValidationSucceeded', inputObj)
      }

      return validTx
    } catch (err) {
      console.log(
        'Error in pay-to-write-access-controller.js/canAppend(). Returning false. Error: \n',
        err
      )
      return false
    }
  }

  // Checks the date of the entry. Returns true if it is older than a year,
  // otherwise it returns false.
  checkDate (payload) {
    const now = new Date()
    const oneYear = 60000 * 60 * 24 * 365
    const oneYearAgo = now.getTime() - oneYear

    const timestamp = payload.value.timestamp

    if (timestamp < oneYearAgo) return true

    return false
  }

  // This is an async wrapper function. It wraps all other logic for validating
  // a new entry and it's proof-of-burn against the blockchain.
  async validateAgainstBlockchain (inputObj) {
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

      // Ensure the wallet has been instantiated.
      await _this.instanceWallet()

      // Validate the signature to ensure the user submitting data owns
      // the address that did the token burn.
      // This prevents 'front running' corner case.
      const validSignature = await _this._validateSignature(
        txid,
        signature,
        message
      )
      console.log('Is valid signature: ', validSignature)
      if (!validSignature) {
        console.log(`Signature for TXID ${txid} is not valid. Rejecting entry.`)
        return false
      }

      // Validate the transaction matches the burning rules.
      validTx = await _this._validateTx(txid, entry)

      return validTx
    } catch (err) {
      console.error(
        'Error in adapters/orbit/pay-to-write-access-controller.js/validateAgainstBlockchain(): ',
        err.message
      )

      // Add the invalid entry to the MongoDB if the error message matches
      // a known pattern.
      if (_this.matchErrorMsg(err.message)) {
        await this.markInvalid(txid)
        return false
      }

      // Throw an error if this is not an anticipated error message.
      throw err
    }
  }

  // Try to match the error message to one of several known error messages.
  // Returns true if there is a match. False if no match.
  matchErrorMsg (msg) {
    if (!msg || typeof msg !== 'string') return false
    // Returned on forged TXID or manipulated ACL rules.
    if (msg.includes('No such mempool or blockchain transaction')) return true

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

  // Returns true if the txid burned at least 0.001 tokens.
  async _validateTx (txid, entry) {
    try {
      if (!txid || typeof txid !== 'string') {
        throw new Error('txid must be a string')
      }

      let isValid = false

      // const txData = await this.bchjs.PsfSlpIndexer.tx(txid)
      let txData = await this.wallet.getTxData([txid])
      txData = txData[0]
      // console.log(`txData: ${JSON.stringify(txData, null, 2)}`)

      const isValidSLPTx = txData.isValidSlp
      // console.log(`txData: ${JSON.stringify(txData, null, 2)}`)
      console.log(`Reviewing TXID: ${txid}`)

      // Return false if txid is not a valid SLP tx.
      if (!isValidSLPTx) {
        console.log(`TX ${txid} is not a valid SLP transaction.`)
        return false
      }

      // const txInfo = await this.bchjs.Transaction.get(txid)
      const txInfo = txData
      // console.log(`txInfo: ${JSON.stringify(txInfo, null, 2)}`)

      // Return false if tokenId does not match.
      if (txInfo.tokenId !== this.config.tokenId) {
        console.log(`TX ${txid} does not consume a valid token.`)
        console.log('txInfo: ', txInfo)

        if (!txInfo.tokenId) {
          throw new Error('Transaction data does not include a token ID.')
        }

        return false
      }

      // Get the difference, or the amount of PSF tokens burned.
      let diff = await this.getTokenQtyDiff(txInfo)
      diff = this.bchjs.Util.floor8(diff)

      // Get the timestamp of the entry.
      let timestamp = entry.payload.value.timestamp
      timestamp = new Date(timestamp)
      console.log('timestamp: ', timestamp)

      // TODO: Try to determine timestamp from the TX. If that fails, fall back
      // to the payload timestamp.

      // Get the required burn price, based on the timestamp.
      console.log('this._options: ', this._options)
      const requiredPrice = this._options.writePrice.getTargetCostPsf(timestamp)
      console.log('requiredPrice: ', requiredPrice)

      // If the difference is above a positive threshold, then it's a burn
      // transaction.
      // Give a 2% grace for rounding errors.
      const tokenQtyWithGrace = this.bchjs.Util.floor8(
        // this.config.reqTokenQty * 0.98
        // ToDo: Replace this with write-price library
        requiredPrice * 0.98
      )

      console.log(`Token diff: ${diff}, threshold: ${tokenQtyWithGrace}`)

      if (diff >= tokenQtyWithGrace) {
        console.log(
          `TX ${txid} proved burn of tokens. Will be allowed to write to DB.`
        )
        isValid = true
      }

      return isValid
    } catch (err) {
      console.error('Error in _validateTx(): ', err.message)

      if (!err.message) console.log('Error: ', err)

      // Handle rate-limit error.
      if (err.error) throw new Error(err.error)

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

  // Get the differential token qty between the inputs and outputs of a tx.
  // This determins if the tx was a proper token burn.
  async getTokenQtyDiff (txInfo) {
    try {
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
      console.log(`difference: ${diff}`)
      return diff
    } catch (err) {
      console.error('Error in getVinVoutDiff: ', err.message)
      throw err
    }
  }

  // Validate a signed messages, to ensure the signer of the message is the owner
  // of the second output of the TX. This ensures the same user who burned the
  // tokens is the same user submitting the new DB entry. It prevents
  // 'front running', or malicous users watching the network for valid burn
  // TXs then using them to submit their own data to the DB.
  async _validateSignature (txid, signature, message) {
    try {
      // Input validation
      if (!txid || typeof txid !== 'string') {
        throw new Error('txid must be a string')
      }
      if (!signature || typeof signature !== 'string') {
        throw new Error('signature must be a string')
      }
      if (!message || typeof message !== 'string') {
        throw new Error('message must be a string')
      }

      let tx = await this.wallet.getTxData([txid])
      // console.log(`tx data: ${JSON.stringify(tx, null, 2)}`)

      if (!tx) throw new Error('Could not get transaction details from BCH service.')

      tx = tx[0]

      // Get the address for the second output of the TX.
      const addresses = tx.vout[1].scriptPubKey.addresses
      const address = addresses[0]

      console.log(`address: ${address}`)
      console.log(`signature: ${signature}`)
      console.log(`message: ${message}`)

      // Verify the signed message is owned by the address.
      const isValid = this.bchjs.BitcoinCash.verifyMessage(
        address,
        signature,
        message
      )

      return isValid
    } catch (err) {
      console.error('Error in _validateSignature ')

      // Dev note: Mock data is needed to
      // if (err.error) throw new Error(err.error)
      throw err
    }
  }
}

module.exports = PayToWriteAccessController
