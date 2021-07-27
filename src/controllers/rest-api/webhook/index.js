/*
  Koa router and controller for REST API endpoints concerned with the Webhook
  entity.
*/

// Public npm libraries.
const Router = require('koa-router')

// Load the REST API Controllers.
const WebhookRESTControllerLib = require('./controller')
// const Validators = require('../middleware/validators')

let _this

class WebhookRESTController {
  constructor (localConfig = {}) {
    // Dependency Injection.
    this.adapters = localConfig.adapters
    if (!this.adapters) {
      throw new Error(
        'Instance of Adapters library required when instantiating Webhook REST Controller.'
      )
    }
    this.useCases = localConfig.useCases
    if (!this.useCases) {
      throw new Error(
        'Instance of Use Cases library required when instantiating Webhook REST Controller.'
      )
    }

    const dependencies = {
      adapters: this.adapters,
      useCases: this.useCases
    }

    // Instantiate the REST API controllers
    // this.postWebhook = new PostWebhook(dependencies)
    // this.deleteWebhook = new DeleteWebhook(dependencies)
    this.webhookRESTController = new WebhookRESTControllerLib(dependencies)

    // Instantiate the router.
    const baseUrl = '/webhook'
    this.router = new Router({ prefix: baseUrl })

    _this = this
  }

  attach (app) {
    if (!app) {
      throw new Error(
        'Must pass app object when attached REST API controllers.'
      )
    }

    // Define the routes and attach the controller.
    this.router.post('/', this.postWebhook)
    this.router.delete('/', this.deleteWebhook)

    // Attach the Controller routes to the Koa app.
    app.use(this.router.routes())
    app.use(this.router.allowedMethods())
  }

  async postWebhook (ctx, next) {
    // await _this.validators.ensureUser(ctx, next)
    await _this.webhookRESTController.postWebhook(ctx, next)
  }

  async deleteWebhook (ctx, next) {
    // await _this.validators.ensureUser(ctx, next)
    await _this.webhookRESTController.deleteWebhook(ctx, next)
  }
}

module.exports = WebhookRESTController
