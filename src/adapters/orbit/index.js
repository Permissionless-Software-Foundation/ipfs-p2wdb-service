/*
  Clean Architecture adapter library for the pay-to-write version of
  Orbit-DB. This creates a custom OrbitDB Access Controller that allows anyone
  to write to this database, so long as they provide proof-of-burn. A
  proof-of-burn is a TXID for a transaction that burns a minimum amount of
  PSF token.
*/

// import OrbitDB from 'orbit-db'
import { createOrbitDB, useAccessController, useDatabaseType } from '@chris.troutner/orbitdb-helia'
import config from '../../../config/index.js'
import validationEvent from './validation-event.js'
// import AccessControllers from 'orbit-db-access-controllers'
import PayToWriteAccessController from './pay-to-write-access-controller.js'
import PayToWriteDatabase from './pay-to-write-database.js'
import P2WCanAppend from './can-append-validator.js'

// AccessControllers.addAccessController({
//   AccessController: PayToWriteAccessController
// })

class OrbitDBAdapter {
  constructor (localConfig = {}) {
    // Dependency injection
    this.ipfs = localConfig.ipfs
    if (!this.ipfs) {
      throw new Error('Must pass an instance of ipfs when instancing the OrbitDBAdapter class.')
    }
    this.writePrice = localConfig.writePrice
    if (!this.writePrice) {
      throw new Error('Pass instance of writePrice when instantiating OrbitDBAdapter library.')
    }
    this.wallet = localConfig.wallet
    if (!this.wallet) {
      throw new Error('Instance of minimal-slp-wallet required when instantiating OrbitDBAdapter library')
    }

    // Encapsulate dependencies
    this.config = config
    this.validationEvent = validationEvent
    this.createOrbitDB = createOrbitDB
    this.P2WCanAppend = P2WCanAppend
    this.useAccessController = useAccessController
    this.useDatabaseType = useDatabaseType
    this.process = process

    // Properties of this class instance.
    this.db = {} // Instance of OrbitDB.
    this.isReady = false

    // Bind 'this' object to all subfunctions
    this.start = this.start.bind(this)
    this.createDb = this.createDb.bind(this)
  }

  // A wrapper to start OrbitDB.
  async start () {
    try {
      if (process.env.TEST_TYPE !== 'e2e') {
        await this.createDb()
      }
      console.log('OrbitDB is ready.')

      return true
    } catch (err) {
      console.error('Error in orbitdb/index.js/start()')
      throw err
    }
  }

  // Create or load an Orbit database.
  // Note: this function assumes that the constructor initializes this.wallet
  // and this.writePrice.
  async createDb (localConfig = {}) {
    try {
      let { dbName } = localConfig

      // By default, use the DB name in the config file.
      if (!dbName) {
        dbName = this.config.orbitDbName
      }

      // dbName = 'psf-bch-p2wdb-keyvalue-v4.0.0-0003'

      // Initialize the P2WCanAppend library
      const p2wdbCanAppend = new this.P2WCanAppend({
        wallet: this.wallet,
        writePrice: this.writePrice
      })

      // Inject an instance of the CanAppend library into the Access Controller.
      PayToWriteAccessController.injectDeps(p2wdbCanAppend)

      PayToWriteDatabase.injectDeps(p2wdbCanAppend.canAppend)

      this.useAccessController(PayToWriteAccessController)
      this.useDatabaseType(PayToWriteDatabase)
      const orbitdb = await this.createOrbitDB({
        ipfs: this.ipfs,
        directory: './.ipfsdata/p2wdb/dbs/keyvalue'
      })

      try {
        this.db = await orbitdb.open(dbName,
          {
            AccessController: PayToWriteAccessController({ write: ['*'] }),
            type: 'payToWrite',
            write: ['*'],
            writePrice: this.writePrice
          }
        )
        console.log(`------>Successfully opened OrbitDB: ${dbName}`)
        console.log('db.address: ', this.db.address)

        // console.log('Syncing database...')
        // const res = await this.db.all()
        // console.log('...finished syncing database. Records in database: ', res.length)

        // Set up event handler to sync database whenever there is an update.
        // this.db.events.on('update', async (entry) => {
        //   // console.log('Update event fired')
        //   console.log('Syncing database...')
        //   const res = await this.db.all()
        //   console.log('...finished syncing database. Records in database: ', res.length)
        // })
      } catch (err) {
        console.log(`------>Error opening Orbit DB named ${dbName}. Error: `, err)
        // console.log(`------>Can not download manifest for OrbitDB ${dbName}.\nExiting`)
        this.exitProgram()
        return false
      }

      // Signal that the OrbitDB is ready to use.
      this.isReady = true

      return this.db
    } catch (err) {
      console.error('Error in createDb(): ', err)
      throw err
    }
  }

  exitProgram () {
    this.process.exit(-1)

    return true
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
export default OrbitDBAdapter
