
// Public npm libraries.

// Local libraries
import Adapters from '../adapters/index.js'
import JSONRPC from './json-rpc/index.js'
import UseCases from '../use-cases/index.js'
import RESTControllers from './rest-api/index.js'
import TimerControllers from './timer-controllers.js'
import config from '../../config/index.js'
import validationEvent from '../adapters/orbit/validation-event.js'

class Controllers {
  constructor (localConfig = {}) {
    // Encapsulate dependencies
    this.adapters = new Adapters()
    this.useCases = new UseCases({ adapters: this.adapters })
    this.timerControllers = new TimerControllers({ adapters: this.adapters, useCases: this.useCases })
    this.config = config

    // Bind 'this' object to each subfunction
    this.initAdapters = this.initAdapters.bind(this)
    this.initUseCases = this.initUseCases.bind(this)
    this.attachRESTControllers = this.attachRESTControllers.bind(this)
    this.attachControllers = this.attachControllers.bind(this)
    this.attachRPCControllers = this.attachRPCControllers.bind(this)
    this.peerEntryAddedEventHandler = this.peerEntryAddedEventHandler.bind(this)

    // Attach the event handler to the event.
    // This event is responsible for adding validated entries to MongoDB.
    // This must come *after* the call to bind().
    validationEvent.on('PeerEntryAdded', this.peerEntryAddedEventHandler)
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
    // Wait for any startup processes to complete for the Adapters libraries.
    // await this.adapters.start()

    // Attach JSON RPC controllers
    this.attachRPCControllers()

    // Attach and start the timer controllers
    this.timerControllers.startTimers()
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
  // OrbitDB by a peer node.
  async peerEntryAddedEventHandler (data) {
    try {
      // console.log(
      //   'ValidationSucceeded event triggering addPeerEntry() with this data: ',
      //   data
      // )

      await this.useCases.entry.addEntry.addPeerEntry(data)
    } catch (err) {
      console.error('Error trying to process peer data with addPeerEntry(): ', err)
      // Do not throw an error. This is a top-level function.
    }
  }
}
export default Controllers
