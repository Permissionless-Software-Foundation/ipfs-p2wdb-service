/*
  Koa router and controller for REST API endpoints concerned with the Entry
  entity.
*/

// Public npm libraries.
const Router = require('koa-router')
const cors = require('kcors')

// Load the REST API Controllers.
const EntryRESTControllerLib = require('./controller')
// const Validators = require('../middleware/validators')

let _this

class EntryController {
  constructor (localConfig = {}) {
    // Dependency Injection.
    this.adapters = localConfig.adapters
    if (!this.adapters) {
      throw new Error(
        'Instance of Adapters library required when instantiating Entry REST Controller.'
      )
    }
    this.useCases = localConfig.useCases
    if (!this.useCases) {
      throw new Error(
        'Instance of Use Cases library required when instantiating Entry REST Controller.'
      )
    }

    const dependencies = {
      adapters: this.adapters,
      useCases: this.useCases
    }

    // Encapsulate dependencies.
    this.entryRESTController = new EntryRESTControllerLib(dependencies)

    // Instantiate the router.
    const baseUrl = '/entry'
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
    this.router.post('/write', this.postEntry)
    this.router.get('/all/:page', this.readAllEntries)
    this.router.get('/hash/:hash', this.getByHash)
    this.router.get('/txid/:txid', this.getByTxid)
    this.router.get('/appid/:appid', this.getByAppId)
    this.router.get('/cost/psf', this.getPsfCost)
    this.router.post('/cost/psf', this.getPsfCostTarget)
    this.router.get('/cost/bch', this.getBchCost)
    this.router.post('/write/bch', this.postBchEntry)

    // Attach the Controller routes to the Koa app.
    app.use(cors({ origin: '*' }))
    app.use(this.router.routes())
    app.use(this.router.allowedMethods())
  }

  async postEntry (ctx, next) {
    // await _this.validators.ensureUser(ctx, next)
    await _this.entryRESTController.postEntry(ctx, next)
  }

  async postBchEntry (ctx, next) {
    // await _this.validators.ensureUser(ctx, next)
    await _this.entryRESTController.postBchEntry(ctx, next)
  }

  async readAllEntries (ctx, next) {
    // await _this.validators.ensureUser(ctx, next)
    await _this.entryRESTController.getAll(ctx, next)
  }

  async getByHash (ctx, next) {
    // await _this.validators.ensureUser(ctx, next)
    await _this.entryRESTController.getByHash(ctx, next)
  }

  async getByTxid (ctx, next) {
    // await _this.validators.ensureUser(ctx, next)
    await _this.entryRESTController.getByTxid(ctx, next)
  }

  async getByAppId (ctx, next) {
    // await _this.validators.ensureUser(ctx, next)
    await _this.entryRESTController.getByAppId(ctx, next)
  }

  async getPsfCost (ctx, next) {
    // await _this.validators.ensureUser(ctx, next)
    await _this.entryRESTController.getPsfCost(ctx, next)
  }

  async getPsfCostTarget (ctx, next) {
    // await _this.validators.ensureUser(ctx, next)
    await _this.entryRESTController.getPsfCostTarget(ctx, next)
  }

  async getBchCost (ctx, next) {
    // await _this.validators.ensureUser(ctx, next)
    await _this.entryRESTController.getBchCost(ctx, next)
  }
}

module.exports = EntryController
