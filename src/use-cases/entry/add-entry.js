
/*
  This is the Class Library for the write-entry use-case. This is when a user
  of this service wants to write a new Entry to the database. This is a different
  use case than a replication event triggered by a new entry from a peer database.
*/

// Global npm libraries
import { Write } from 'p2wdb'
import DBEntry from '../../entities/db-entry.js'
import config from '../../../config/index.js'
import axios from 'axios'

let _this

class AddEntry {
  constructor (localConfig = {}) {
    this.adapters = localConfig.adapters
    if (!this.adapters) {
      throw new Error('Instance of adapters must be passed in when instantiating Entry Use Cases library.')
    }
    if (!localConfig.adapters.p2wdb) {
      throw new Error('p2wdb adapter instance must be included when instantiating AddEntry use case')
    }
    this.p2wdbAdapter = localConfig.adapters.p2wdb
    if (!localConfig.adapters.entry) {
      throw new Error('entry adapter instance must be included when instantiating AddEntry use case')
    }
    this.entryAdapter = localConfig.adapters.entry

    // Encapsulate dependencies.
    this.dbEntry = new DBEntry()
    this.config = config
    this.Write = Write
    this.axios = axios

    // Bind 'this' object to class subfunctions
    this.addTicketEntry = this.addTicketEntry.bind(this)

    _this = this
  }

  async addUserEntry (rawData) {
    try {
      console.log('addUserEntry() rawData: ', rawData)

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

  // Trigger by an event when a peer adds a new entry to the mongo database.
  // This function is primarily triggered by the canAppend() library after
  // it has successfully validated a new entry.
  async addPeerEntry (peerData) {
    console.log('Entering addPeerEntry()')
    // console.log('Entering addPeerEntry() with this data: ', peerData)

    // Attempt to extract the 'appId' property from the data.
    peerData = this._extractAppId(peerData)

    // Create a new entry Entity
    const entry = _this.dbEntry.makePeerEntry(peerData)

    // Throw an error if the entry already exists.
    const exists = await _this.entryAdapter.doesEntryExist(entry)
    if (exists) {
      throw new Error('addPeerEntry(): Entry already exists in the database.')
    }

    // The entry already exists in the P2WDB OrbitDB, so nothing needs to be
    // done on that front.

    // Add the entry to the local database (Mongo).
    await _this.entryAdapter.insert(entry)

    return true
  }

  // This function was created as part of the Helia refactor. Because the
  // databases are not automatically syncing, a Timer Controller will periodicially
  // try to sync by iterating over the database. Entries are passed to this
  // use case to try and add them to the database.
  // async addSyncEntry (inObj = {}) {
  //   try {
  //     // Extract variables from input OrbitDB entry
  //     const { key, value, hash } = inObj
  //     const { data, message, signature } = value
  //
  //     // Attempt to extract the 'appId' property from the data.
  //     const peerData = this._extractAppId(value)
  //     // console.log('peerData: ', peerData)
  //     const appId = peerData.appId
  //
  //     // Validate the entry by creating a User Entry Entity.
  //     const peerEntry = {
  //       txid: key,
  //       signature,
  //       message,
  //       data,
  //       hash,
  //       appId
  //     }
  //     const entry = _this.dbEntry.makeUserEntry(peerEntry)
  //
  //     // Throw an error if the entry already exists.
  //     const exists = await _this.entryAdapter.doesEntryExist(entry)
  //     if (exists) {
  //       throw new Error('Entry already exists in the database.')
  //     }
  //
  //     // Add the entry to the P2WDB OrbitDB.
  //     const hash2 = await _this.p2wdbAdapter.insert(entry)
  //     entry.hash = hash2
  //     entry.isValid = true
  //     console.log(`entry.hash (${entry.hash}) should match the original hash of ${hash}`)
  //   } catch (err) {
  //     console.error('Error in use-cases/entry/add-entry.js/addSyncEntry()')
  //     throw err
  //   }
  // }

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
      const balance = await this.adapters.wallet.bchWallet.getBalance({ bchAddress: address })
      // console.log('balance: ', balance)

      // Throw error if address does not have the necessary payment.
      if (balance < requiredFee) {
        throw new Error(`The balance of address ${address} is ${balance} sats, which is less than the required fee of ${requiredFee} sats.`)
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
      const write = new this.Write({
        bchWallet: this.adapters.wallet.bchWallet,
        wif: appWif,
        serverURL: `http://localhost:${this.config.port}`,
        interface: blockchainInterface
      })
      const hash = await write.postEntry(data, appId)
      return hash
    } catch (err) {
      console.error('Error in add-entry.js/addBchEntry(): ', err)
      throw err
    }
  }

  // User is paying in BCH for P2WDB instance to consume a pre-burned ticket.
  // High-level workflow (order of operations matter in the event of an error):
  // - Ensure the user has sent payment to the app wallet.
  // - Retrieve a ticket and use it to write data to the database.
  // - Move the BCH payment to the root wallet.
  // - Delete the payment DB model.
  async addTicketEntry (rawData) {
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
      const balance = await this.adapters.wallet.bchWallet.getBalance({ bchAddress: address })
      console.log(`balance for address ${address.toString()}: `, balance)

      // Throw error if address does not have the necessary payment.
      if (balance < requiredFee) {
        throw new Error(`The balance of address ${address} is ${balance} sats, which is less than the required fee of ${requiredFee} sats.`)
      }

      // Get a ticket from the database.
      const tickets = await this.adapters.localdb.Tickets.find({})

      // Throw error if there are no tickets.
      if (!tickets.length) {
        throw new Error('No pre-burned tickets available.')
      }

      const ticket = tickets[0]

      // Delete the ticket from the database, so that it's not used again (in
      // the case of rapid REST API calls).
      await ticket.remove()

      try {
        // Write an entry to this P2WDB, using a pre-burned ticket.
        const now = new Date()
        const dataObj = {
          appId,
          data,
          timestamp: now.toISOString(),
          localTimeStamp: now.toLocaleString()
        }
        const bodyData = {
          txid: ticket.txid,
          message: ticket.message,
          signature: ticket.signature,
          data: JSON.stringify(dataObj)
        }
        // const result = await this.axios.post('http://localhost:5010/entry/write', bodyData)
        const result = await this.axios.post(`http://localhost:${this.config.port}/entry/write`, bodyData)

        const hash = result.data
        console.log('hash: ', hash)

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

        // Delete the BCH payment database model.
        await bchPayment.remove()
        console.log('ticket consumed: ', ticket)
        // Delete the ticket from the database.
        // await ticket.remove()

        return {
          hash,
          proofOfBurn: ticket.txid
        }
      } catch (err) {
        // Restore the ticket to the database, if an error occurs while trying
        // to consume it.
        const newTicket = new this.adapters.localdb.Tickets(ticket)
        await newTicket.save()
        console.log('Ticket restored before throwing error.')

        throw err
      }
    } catch (err) {
      console.error('Error in use-cases/entry/add-entry.js/addTicketEntry(): ', err)
      throw err
    }
  }

  // This function is used for easier mocking during tests.
  async _createTempWallet (wif) {
    const advancedConfig = { interface: 'consumer-api' }

    // Detect and configure different blockchain infrastructure settings.
    if (_this.config.useFullStackCash) {
      advancedConfig.interface = 'rest-api'
      advancedConfig.restURL = _this.config.apiServer
      advancedConfig.authPass = _this.config.authPass
    }

    const tempWallet = new this.adapters.wallet.BchWallet(wif, advancedConfig)
    await tempWallet.walletInfoPromise
    return tempWallet
  }
}
export default AddEntry
