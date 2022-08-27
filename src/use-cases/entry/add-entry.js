/*
  This is the Class Library for the write-entry use-case. This is when a user
  of this service wants to write a new Entry to the database. This is a different
  use case than a replication event triggered by a new entry from a peer database.
*/

// Global npm libraries
const { Write } = require('p2wdb/index')

// Local libraries
const DBEntry = require('../../entities/db-entry')
const config = require('../../../config')

let _this

class AddEntry {
  constructor (localConfig = {}) {
    this.adapters = localConfig.adapters
    if (!this.adapters) {
      throw new Error(
        'Instance of adapters must be passed in when instantiating Entry Use Cases library.'
      )
    }
    if (!localConfig.adapters.p2wdb) {
      throw new Error(
        'p2wdb adapter instance must be included when instantiating AddEntry use case'
      )
    }
    this.p2wdbAdapter = localConfig.adapters.p2wdb
    if (!localConfig.adapters.entry) {
      throw new Error(
        'entry adapter instance must be included when instantiating AddEntry use case'
      )
    }
    this.entryAdapter = localConfig.adapters.entry

    // Encapsulate dependencies.
    this.dbEntry = new DBEntry()
    this.config = config
    this.Write = Write

    _this = this
  }

  async addUserEntry (rawData) {
    try {
      // Generate a validated entry by passing the raw data through input validation.
      const entry = _this.dbEntry.makeUserEntry(rawData)

      // Throw an error if the entry already exists.
      const exists = await _this.entryAdapter.doesEntryExist(entry)
      if (exists) {
        throw new Error('Entry already exists in the database.')
      }

      // Add the entry to the P2WDB OrbitDB.
      const hash = await _this.p2wdbAdapter.insert(entry)
      entry.hash = hash
      entry.isValid = true

      // Note: Inserting the entry into the P2WDB will trigger the
      // ValidationSucceeded event. This event will automatically add the entry
      // to the local MongoDB.

      return hash
    } catch (err) {
      console.error('Error in add-entry.js/addUserEntry(): ', err)
      throw err
    }
  }

  // Trigger by an event when a peer adds a new entry to the database.
  async addPeerEntry (peerData) {
    // Attempt to extract the 'appId' property from the data.
    peerData = this._extractAppId(peerData)
    console.log('Entering addPeerEntry() with this data: ', peerData)

    const entry = _this.dbEntry.makePeerEntry(peerData)

    // Throw an error if the entry already exists.
    const exists = await _this.entryAdapter.doesEntryExist(entry)
    if (exists) {
      throw new Error('Entry already exists in the database.')
    }

    // The entry already exists in the P2WDB OrbitDB, so nothing needs to be
    // done on that front.

    // Add the entry to the local database (Mongo).
    await _this.entryAdapter.insert(entry)

    return true
  }

  // Attempt to extract the appId property from the data.
  _extractAppId (peerData) {
    try {
      // The parse() command will throw an error if the data isn't JSON.
      // In that case, the catch() function will exit quietly.
      const data = JSON.parse(peerData.data)

      const appId = data.appId

      peerData.appId = appId

      return peerData
    } catch (err) {
      console.log('Error in _extractAppId(): ', err)
      // Exit quietly.
      return peerData
    }
  }

  // User is paying in BCH for P2WDB instance to burn PSF tokens and write
  // data on their behalf.
  async addBchEntry (rawData) {
    try {
      // const { address, data, appId } = rawData
      const { address, data, appId } = rawData

      // Verify that bchPayment model exists.
      const BchPaymentModel = this.adapters.localdb.BchPayment
      const bchPayment = await BchPaymentModel.findOne({ address })
      // console.log('bchPayment: ', bchPayment)

      // Throw error if bchPayment does not exist.
      if (!bchPayment) {
        throw new Error('Payment model not found. Call POST /entry/cost/bch first to get a BCH payment address.')
      }

      // Verify that address has the required BCH payment.
      const requiredFee = bchPayment.bchCost
      const balance = await this.adapters.wallet.bchWallet.getBalance(address)
      // console.log('balance: ', balance)

      // Throw error if address does not have the necessary payment.
      if (balance < requiredFee) {
        throw new Error(`The balance of address ${address} is ${requiredFee} sats, which is less than the required fee of ${balance} sats.`)
      }

      // Get the private key for the payment address.
      const keyPair = await this.adapters.wallet.getKeyPair(bchPayment.hdIndex)
      if (keyPair.cashAddress !== address) {
        throw new Error(`Unexpected error: HD index ${bchPayment.hdIndex} generated address ${keyPair.cashAddress}, which does not match expected address ${address}`)
      }
      // console.log('keyPair: ', keyPair)

      // Instantiate a wallet using the addresses private key.
      // const tempWallet = new this.adapters.wallet.BchWallet(keyPair.wif, { interface: 'consumer-api' })
      const tempWallet = await this._createTempWallet(keyPair.wif)
      await tempWallet.initialize()

      // Move payment to app's root address.
      const rootAddr = this.adapters.wallet.bchWallet.walletInfo.cashAddress
      const txid1 = await tempWallet.sendAll(rootAddr)
      console.log(`Sent ${balance} sats to root address ${rootAddr}. TXID: ${txid1}`)

      // Delete the database model.
      await bchPayment.remove()

      let blockchainInterface = 'consumer-api'
      if (this.config.useFullStackCash) {
        blockchainInterface = 'rest-api'
      }

      // Write an entry to this P2WDB, using the PSF tokens in this apps wallet.
      const appWif = this.adapters.wallet.bchWallet.walletInfo.privateKey

      const write = new this.Write({ wif: appWif, serverURL: `http://localhost:${this.config.port}`, interface: blockchainInterface })
      const hash = await write.postEntry(data, appId)

      return hash
    } catch (err) {
      console.error('Error in add-entry.js/addBchEntry(): ', err)
      throw err
    }
  }

  // This function is used for easier mocking during tests.
  async _createTempWallet (wif) {
    const tempWallet = new this.adapters.wallet.BchWallet(wif, { interface: 'consumer-api' })
    await tempWallet.walletInfoPromise
    return tempWallet
  }
}

module.exports = AddEntry
