/*
  REST API library for pinning content with this IPFS node.
*/

// Public npm libraries.
import Router from 'koa-router'
import cors from 'kcors'

// Local libraries.
import PinRESTControllerLib from './controller.js'

class PinJsonRouter {
  constructor (localConfig = {}) {
    // Dependency Injection.
    this.adapters = localConfig.adapters
    if (!this.adapters) {
      throw new Error(
        'Instance of Adapters library required when instantiating /pin REST Controller.'
      )
    }
    this.useCases = localConfig.useCases
    if (!this.useCases) {
      throw new Error(
        'Instance of Use Cases library required when instantiating /pin REST Controller.'
      )
    }

    const dependencies = {
      adapters: this.adapters,
      useCases: this.useCases
    }

    // Encapsulate dependencies.
    this.pinRESTController = new PinRESTControllerLib(dependencies)

    // Instantiate the router and set the base route.
    const baseUrl = '/pin'
    this.router = new Router({ prefix: baseUrl })
  }

  attach (app) {
    if (!app) {
      throw new Error(
        'Must pass app object when attaching REST API controllers.'
      )
    }

    // Define the routes and attach the controller.
    this.router.post('/json', this.pinRESTController.pinJson)

    // Attach the Controller routes to the Koa app.
    app.use(cors({ origin: '*' }))
    app.use(this.router.routes())
    app.use(this.router.allowedMethods())
  }
}

export default PinJsonRouter
