/*
  Adapter for the pay-to-write database (P2WDB).
  This library provides high-level abstraction for interacting with the P2WDB,
  which is composed of IPFS, ipfs-coord, and OrbitDB.

  This library sets of a series of asynchronous events in several other libraries.
  Here are a few design approaches adopted in this library:
  - When instantiating a new Class, the constructor should return immediately
    and have no side effects. e.g. it should not call an async function.
  - An async start() method is called to kick off any downstream libraries that
    need to be started.
  - An isReady flag can be checked to see if any dependency is in a ready state.
*/

// Local libraries
import IpfsAdapters from '../ipfs/index.js'
import OribitAdapter from '../orbit/index.js'
import KeyValue from '../localdb/models/key-value.js'

// Customizable constants.
const ENTRIES_PER_PAGE = 20

let _this

class P2WDB {
  constructor (localConfig = {}) {
    // console.log('p2wdb localConfig: ', localConfig)
    // Dependency injection
    this.writePrice = localConfig.writePrice
    if (!this.writePrice) {
      throw new Error('Pass instance of writePrice when instantiating P2WDB adapter library.')
    }
    this.wallet = localConfig.wallet
    if (!this.wallet) {
      throw new Error('Instance of wallet required when instantiating P2WDB adapter library.')
    }

    // Encapsulate dependencies
    this.ipfsAdapters = new IpfsAdapters()
    this.KeyValue = KeyValue
    this.OribitAdapter = OribitAdapter

    // Properties of this class instance.
    this.isReady = false
    _this = this
  }

  // Start OrbitDB.
  async start (localConfig = {}) {
    try {
      const { ipfs, bchjs } = localConfig
      if (!ipfs) {
        throw new Error('Must past instance of IPFS when instantiating P2WDB adapter.')
      }
      if (!bchjs) {
        throw new Error('Must past instance of bchjs when instantiating P2WDB adapter.')
      }

      // Start the P2WDB OrbitDB.
      this.orbit = new this.OribitAdapter({
        ipfs,
        writePrice: this.writePrice,
        wallet: this.wallet
      })
      await this.orbit.start()
      console.log('OrbitDB Adapter is ready. P2WDB is ready.')

      this.isReady = true
      console.log('The P2WDB is ready to use.')

      return this.isReady
    } catch (err) {
      console.error('Error in adapters/p2wdb/index.js/start()')
      throw err
    }
  }

  // Insert a new entry into the database.
  // Returns the hash generated by OrbitDB for the new entry.
  async insert (entry) {
    try {
      console.log('insert entry: ', entry)
      // console.log('_this.orbit.db: ', this.orbit.db)
      // Add the entry to the Oribit DB.
      const hash = await this.orbit.db.put(entry.key, entry.value)
      console.log('hash: ', hash)
      return hash
    } catch (err) {
      console.error('Error in p2wdb.js/insert()')
      throw err
    }
  }

  // Read the latest ENTRIES_PER_PAGE entries in the database.
  async readAll (page = 0) {
    try {
      // Pull data from MongoDB.
      // Get all entries in the database.
      const data = await this.KeyValue.find({})
      // Sort entries so newest entries show first.
        .sort('-createdAt')
      // Skip to the start of the selected page.
        .skip(page * ENTRIES_PER_PAGE)
      // Only return 20 results.
        .limit(ENTRIES_PER_PAGE)
      // console.log('data: ', data)
      return data
    } catch (err) {
      console.error('Error in p2wdb.js/readAll()')
      throw err
    }
  }

  // Read the latest ENTRIES_PER_PAGE entries, filtered by the app ID.
  async readByAppId (appId, page = 0) {
    try {
      // console.log('appId: ', appId)
      // const data = _this.orbit.db.get(txid)
      // Return empty array if appId is not defined.
      if (!appId) { return [] }
      // Get paginated results from the database.
      const data = await this.KeyValue.find({ appId })
      // Sort entries so newest entries show first.
        .sort('-createdAt')
      // Skip to the start of the selected page.
        .skip(page * ENTRIES_PER_PAGE)
      // Only return 20 results.
        .limit(ENTRIES_PER_PAGE)
      return data
    } catch (err) {
      console.error('Error in p2wdb.js/readByAppId()')
      throw err
    }
  }

  async readByHash (hash) {
    try {
      console.log('hash: ', hash)
      // Note: No good way listed in API reference for getting entry by hash from
      // OrbitDB directly.
      // https://github.com/orbitdb/orbit-db/blob/main/API.md
      // const data = _this.orbit.db.get(hash)
      // Get an entry from MongoDB.
      const data = await _this.KeyValue.findOne({ hash })
      // console.log('data: ', data)
      return data
    } catch (err) {
      console.error('Error in p2wdb.js/readByHash()')
      throw err
    }
  }

  async readByTxid (txid) {
    try {
      console.log('txid: ', txid)
      // const data = _this.orbit.db.get(txid)
      // Find the data in the local database
      const data = await _this.KeyValue.findOne({ key: txid })
      // console.log('data: ', data)
      return data
    } catch (err) {
      console.error('Error in p2wdb.js/readByTxid()')
      throw err
    }
  }
}
export default P2WDB
