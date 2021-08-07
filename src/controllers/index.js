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
      // console.log(`process.env.TEST_TYPE: ${process.env.TEST_TYPE}`)

      // Get a JWT token and instantiate bch-js with it. Then pass that instance
      // to all the rest of the apps controllers and adapters.
      await adapters.fullStackJwt.getJWT()
      // Instantiate bch-js with the JWT token, and overwrite the placeholder for bch-js.
      adapters.bchjs = await adapters.fullStackJwt.instanceBchjs()
      const bchjs = adapters.bchjs

      // Attach the REST controllers to the Koa app.
      this.attachRESTControllers(app)

      // Start IPFS.
      await this.adapters.ipfs.start({ bchjs: adapters.bchjs })

      // Get a handle on the IPFS node.
      const ipfs = this.adapters.ipfs.ipfs

      // Start the P2WDB and attach the validation event handler/controller to
      // the add-entry Use Case.
      // console.log('About to attached validation controller...')
      // await this.attachValidationController()
      // console.log('...validation controller attached.')

      // Start the P2WDB.
      await this.adapters.p2wdb.start({ ipfs, bchjs })

      this.attachRPCControllers()
    } catch (err) {
      console.error('Error in controllers/index.js/attachControllers()')
      throw err
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
}

module.exports = Controllers
