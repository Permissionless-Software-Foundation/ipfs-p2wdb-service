
// Public npm libraries.
import Router from 'koa-router'

// Local libraries.
import ContactRESTControllerLib from './controller.js'

class ContactRouter {
  constructor (localConfig = {}) {
    // Dependency Injection.
    this.adapters = localConfig.adapters
    if (!this.adapters) {
      throw new Error('Instance of Adapters library required when instantiating Contact REST Controller.')
    }
    this.useCases = localConfig.useCases
    if (!this.useCases) {
      throw new Error('Instance of Use Cases library required when instantiating Contact REST Controller.')
    }

    const dependencies = {
      adapters: this.adapters,
      useCases: this.useCases
    }

    // Encapsulate dependencies.
    this.contactRESTController = new ContactRESTControllerLib(dependencies)

    // Instantiate the router and set the base route.
    const baseUrl = '/contact'
    this.router = new Router({ prefix: baseUrl })

    // Bind the 'this' object to all subfunctions.
    this.attach = this.attach.bind(this)
    // this.getAllowList = this.getAllowList.bind(this)
  }

  attach (app) {
    if (!app) {
      throw new Error('Must pass app object when attaching REST API controllers.')
    }

    // Define the routes and attach the controller.
    this.router.post('/email', this.contactRESTController.email)
    // this.router.get('/allowlist', this.getAllowList)

    // Attach the Controller routes to the Koa app.
    app.use(this.router.routes())
    app.use(this.router.allowedMethods())
  }
}
export default ContactRouter
