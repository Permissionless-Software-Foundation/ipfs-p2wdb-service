/*
  This is a top-level library that encapsulates all the additional Controllers.
  The concept of Controllers comes from Clean Architecture:
  https://troutsblog.com/blog/clean-architecture
*/

// Public npm libraries.

// Load the Clean Architecture Adapters library
const adapters = require('../adapters')
const validationEvent = require('../adapters/orbit/validation-event')

// Load the JSON RPC Controller.
const JSONRPC = require('./json-rpc')

// Load the Clean Architecture Use Case libraries.
const UseCases = require('../use-cases')
// const useCases = new UseCases({ adapters })

// Load the REST API Controllers.
const RESTControllers = require('./rest-api')

let _this

class Controllers {
  constructor (localConfig = {}) {
    this.adapters = adapters
    this.useCases = new UseCases({ adapters })

    // Attach the event handler to the event.
    validationEvent.on(
      'ValidationSucceeded',
      this.validationSucceededEventHandler
    )

    _this = this
  }

  async attachControllers (app) {
    try {
      // Attach the REST controllers to the Koa app.
      this.attachRESTControllers(app)

      // Start IPFS.
      await this.adapters.ipfs.start()

      // Get a handle on the IPFS node.
      const ipfs = this.adapters.ipfs.ipfs

      // Start the P2WDB and attach the validation event handler/controller to
      // the add-entry Use Case.
      // console.log('About to attached validation controller...')
      // await this.attachValidationController()
      // console.log('...validation controller attached.')

      // Start the P2WDB.
      await this.adapters.p2wdb.start(ipfs)

      this.attachRPCControllers()
    } catch (err) {
      console.error('Error in controllers/index.js/attachControllers()')
    }
  }

  // Top-level function for this library.
  // Start the various Controllers and attach them to the app.
  attachRESTControllers (app) {
    const rESTControllers = new RESTControllers({
      adapters: this.adapters,
      useCases: this.useCases
    })

    // Attach the REST API Controllers associated with the boilerplate code to the Koa app.
    rESTControllers.attachRESTControllers(app)
  }

  // Add the JSON RPC router to the ipfs-coord adapter.
  attachRPCControllers () {
    const jsonRpcController = new JSONRPC({
      adapters: this.adapters,
      useCases: this.useCases
    })

    // Attach the input of the JSON RPC router to the output of ipfs-coord.
    this.adapters.ipfs.ipfsCoordAdapter.attachRPCRouter(
      jsonRpcController.router
    )
  }

  // Event handler that is triggered when a new entry is added to the P2WDB
  // OrbitDB.
  async validationSucceededEventHandler (data) {
    try {
      // console.log(
      //   'ValidationSucceeded event triggering addPeerEntry() with this data: ',
      //   data
      // )

      await _this.useCases.entry.addEntry.addPeerEntry(data)
    } catch (err) {
      console.error(
        'Error trying to process peer data with addPeerEntry(): ',
        err
      )
      // Do not throw an error. This is a top-level function.
    }
  }

  // Start the P2WDB and its downstream depenencies (IPFS, ipfs-coord, OrbitDB).
  // Also attach the post-validation, peer-replication event handler (controller)
  // to the Add-Entry Use Case.
  // async attachValidationController () {
  //   try {
  //     console.log(
  //       'attachValidationController() this.adapters.p2wdb.orbit: ',
  //       this.adapters.p2wdb.orbit
  //     )
  //
  //     // Trigger the addPeerEntry() use-case after a replication-validation event.
  //     this.adapters.p2wdb.orbit.validationEvent.on(
  //       'ValidationSucceeded',
  //       async function (data) {
  //         try {
  //           console.log(
  //             'ValidationSucceeded event triggering addPeerEntry() with this data: ',
  //             data
  //           )
  //
  //           await _this.useCases.entry.addEntry.addPeerEntry(data)
  //         } catch (err) {
  //           console.error(
  //             'Error trying to process peer data with addPeerEntry(): ',
  //             err
  //           )
  //           // Do not throw an error. This is a top-level function.
  //         }
  //       }
  //     )
  //   } catch (err) {
  //     console.error('Error in controllers/index.js/startP2wdb()')
  //     throw err
  //   }
  // }
}

module.exports = Controllers
