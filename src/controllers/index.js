import Adapters from '../adapters/index.js'
import validationEvent from '../adapters/orbit/validation-event.js'
import UseCases from '../use-cases/index.js'
import JSONRPC from './json-rpc/index.js'
import RESTControllers from './rest-api/index.js'
import TimerControllers from './timer-controllers.js'

let _this

class Controllers {
  constructor (localConfig = {}) {
    // Encapsulate dependencies
    this.adapters = new Adapters()
    this.useCases = new UseCases({ adapters: this.adapters })
    this.timerControllers = new TimerControllers({
      adapters: this.adapters,
      useCases: this.useCases
    })
    // Attach the event handler to the event.
    // This event is responsible for adding validated entries to MongoDB.
    validationEvent.on('ValidationSucceeded', this.validationSucceededEventHandler)
    _this = this
  }

  // Spin up any adapter libraries that have async startup needs.
  async initAdapters () {
    await this.adapters.start()
  }

  // Run any Use Cases to startup the app.
  async initUseCases () {
    await this.useCases.start()
  }

  // Top-level function for this library.
  // Start the various Controllers and attach them to the app.
  attachRESTControllers (app) {
    const restControllers = new RESTControllers({
      adapters: this.adapters,
      useCases: this.useCases
    })
    // Attach the REST API Controllers associated with the boilerplate code to the Koa app.
    restControllers.attachRESTControllers(app)
  }

  // Attach any other controllers other than REST API controllers.
  async attachControllers (app) {
    // RPC controllers
    this.attachRPCControllers()
    // Add any additional controllers here.
  }

  // Add the JSON RPC router to the ipfs-coord adapter.
  attachRPCControllers () {
    const jsonRpcController = new JSONRPC({
      adapters: this.adapters,
      useCases: this.useCases
    })
    // Attach the input of the JSON RPC router to the output of ipfs-coord.
    this.adapters.ipfs.ipfsCoordAdapter.attachRPCRouter(jsonRpcController.router)
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
      console.error('Error trying to process peer data with addPeerEntry(): ', err)
      // Do not throw an error. This is a top-level function.
    }
  }
}
export default Controllers
