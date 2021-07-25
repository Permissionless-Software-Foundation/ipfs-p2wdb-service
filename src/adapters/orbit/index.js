/*
  This is a Clean Architecture Adapter for OrbitDB.
*/

// Public npm libraries.
const OrbitDB = require('orbit-db')

// Local libraries
const config = require('../../../config')
const validationEvent = require('./validation-event')
// const wlogger = require('../wlogger')
// const KeyValue = require('../../models/key-value')

// Define the pay-to-write access controller.
const AccessControllers = require('orbit-db-access-controllers')
const PayToWriteAccessController = require('./pay-to-write-access-controller')
AccessControllers.addAccessController({
  AccessController: PayToWriteAccessController
})

// let _this

class OrbitDBAdapter {
  constructor (localConfig = {}) {
    // Input Validation
    if (!localConfig.ipfs) {
      throw new Error(
        'Must pass an instance of ipfs when instancing the OrbitDBAdapter class.'
      )
    }
    this.ipfs = localConfig.ipfs

    // Encapsulate dependencies
    this.config = config
    this.validationEvent = validationEvent
    this.OrbitDB = OrbitDB

    // Properties of this class instance.
    this.db = {} // Instance of OrbitDB.
    this.isReady = false

    // _this = this
  }

  // A wrapper to start OrbitDB.
  async start () {
    try {
      await this.createDb()
      console.log('OrbitDB is ready.')
    } catch (err) {
      console.error('Error in orbitdb/index.js/start()')
      throw err
    }
  }

  // Create or load an Orbit database.
  async createDb (dbName) {
    try {
      // By default, use the DB name in the config file.
      if (!dbName) {
        dbName = this.config.orbitDbName
      }
      const orbitdb = await this.OrbitDB.createInstance(this.ipfs, {
        // directory: "./orbitdb/examples/eventlog",
        directory: './orbitdb/dbs/keyvalue',
        AccessControllers: AccessControllers
      })

      const options = {
        accessController: {
          type: 'payToWrite',
          write: ['*']
        }
      }

      // dbName =
      //   '/orbitdb/zdpuAtkE6etPNfEKR7eGdgGpEFjJF2QKWNatDTk6VBxU7qJTo/testdb011'

      // Create the key-value store.
      this.db = await orbitdb.keyvalue(dbName, options)

      console.log('OrbitDB ID: ', this.db.id)

      // Load data persisted to the hard drive.
      await this.db.load()

      // The replication event is triggered when one peer-db on the network
      // adds a record. This is the signal that new data has arrived and
      // the node needs to replicate it. This event is also triggered repeatedly
      // when a new node enters the network and synces their local database
      // to their peers.
      // this.db.events.on('replicate', this.handleReplicateEvent)

      // validationEvent.on('ValidationSucceeded', function (data) {
      //   console.log('ValidationSucceeded event triggered. Data: ', data)
      // })

      // Signal that the OrbitDB is ready to use.
      this.isReady = true

      return this.db
    } catch (err) {
      console.error('Error in createDb()')
      throw err
    }
  }

  // The event handler.
  // handleReplicateEvent (address, entry) {
  //   try {
  //     console.log('replicate event fired')
  //     console.log('replicate address: ', address)
  //     console.log('replicate entry: ', entry)
  //
  //     const data = _this.db.get(entry)
  //     console.log('entry data: ', data)
  //
  //     const all = _this.db.all
  //     console.log('all entries: ', all)
  //   } catch (err) {
  //     // Top-level function. Do not throw an error.
  //     console.error('Error in handleReplicateEvent(): ', err)
  //   }
  // }

  // Read all entries in the OrbitDB.
  readAll () {
    try {
      // console.log('this.db: ', this.db)

      const allData = this.db.all

      return allData
    } catch (err) {
      console.error('Error in pay-to-write.js/readAll()')
      throw err
    }
  }
}

module.exports = OrbitDBAdapter
