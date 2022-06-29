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
    // Dependency injection
    this.ipfs = localConfig.ipfs
    if (!this.ipfs) {
      throw new Error(
        'Must pass an instance of ipfs when instancing the OrbitDBAdapter class.'
      )
    }
    this.writePrice = localConfig.writePrice
    if (!this.writePrice) {
      throw new Error('Pass instance of writePrice when instantiating OrbitDBAdapter adapter library.')
    }

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
  async start (bchjs) {
    try {
      if (process.env.TEST_TYPE !== 'e2e') {
        await this.createDb({ bchjs })
      }

      console.log('OrbitDB is ready.')

      return true
    } catch (err) {
      console.error('Error in orbitdb/index.js/start()')
      throw err
    }
  }

  // Create or load an Orbit database.
  async createDb (localConfig = {}) {
    try {
      let { dbName, bchjs } = localConfig

      if (!bchjs) {
        throw new Error('Instance of bchjs required when called createDb()')
      }

      // By default, use the DB name in the config file.
      if (!dbName) {
        dbName = this.config.orbitDbName
      }

      const orbitdb = await this.OrbitDB.createInstance(this.ipfs, {
        // directory: "./orbitdb/examples/eventlog",
        directory: './.ipfsdata/p2wdb/dbs/keyvalue',
        AccessControllers: AccessControllers
      })

      const options = {
        accessController: {
          type: 'payToWrite',
          write: ['*'],
          writePrice: this.writePrice
        }
      }

      // console.log('dbName: ', dbName)

      // Create the key-value store.
      try {
        this.db = await orbitdb.keyvalue(dbName, options)
      } catch (err) {
        console.log(`Can not download manifest for OrbitDB ${dbName}.\nExiting`)
        this.exitProgram()
      }

      // Overwrite the default bchjs instance used by the pay-to-write access
      // controller.
      this.db.options.accessController.bchjs = bchjs
      this.db.access.bchjs = bchjs
      this.db.access._this = this.db.access
      // console.log('this.db: ', this.db)

      console.log('OrbitDB ID: ', this.db.id)

      // Load data persisted to the hard drive.
      // await this.db.load()
      this.db.load()

      // Signal that the OrbitDB is ready to use.
      this.isReady = true

      return this.db
    } catch (err) {
      console.error('Error in createDb(): ', err)
      throw err
    }
  }

  exitProgram () {
    process.exit(-1)
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
