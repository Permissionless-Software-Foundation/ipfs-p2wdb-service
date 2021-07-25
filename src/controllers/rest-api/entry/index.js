/*
  Koa router and controller for REST API endpoints concerned with the Entry
  entity.
*/

// Public npm libraries.
const Router = require('koa-router')

// Load the REST API Controllers.
const PostEntry = require('./post-entry')
const GetAll = require('./get-all')
const GetByHash = require('./get-by-hash')
const GetByTxid = require('./get-by-txid')
const GetByAppId = require('./get-by-appid')

class EntryController {
  constructor (localConfig = {}) {
    // Dependency Injection.
    this.adapters = localConfig.adapters
    if (!this.adapters) {
      throw new Error(
        'Instance of Adapters library required when instantiating PostEntry REST Controller.'
      )
    }
    this.useCases = localConfig.useCases
    if (!this.useCases) {
      throw new Error(
        'Instance of Use Cases library required when instantiating PostEntry REST Controller.'
      )
    }

    const dependencies = {
      adapters: this.adapters,
      useCases: this.useCases
    }

    // Instantiate the REST API controllers
    this.postEntry = new PostEntry(dependencies)
    this.readAllEntries = new GetAll(dependencies)
    this.getByHash = new GetByHash(dependencies)
    this.getByTxid = new GetByTxid(dependencies)
    this.getByAppId = new GetByAppId(dependencies)

    // Instantiate the router.
    const baseUrl = '/p2wdb'
    this.router = new Router({ prefix: baseUrl })
  }

  attachControllers (app) {
    if (!app) {
      throw new Error(
        'Must pass app object when attached REST API controllers.'
      )
    }

    // curl -H "Content-Type: application/json" -X POST -d '{ "user": "test" }' localhost:5001/p2wdb/write
    this.router.post('/write', this.postEntry.routeHandler)

    // curl -H "Content-Type: application/json" -X GET localhost:5001/p2wdb/all
    this.router.get('/all', this.readAllEntries.routeHandler)

    // curl -H "Content-Type: application/json" -X GET localhost:5001/p2wdb/hash/:hash
    this.router.get('/hash/:hash', this.getByHash.routeHandler)

    // curl -H "Content-Type: application/json" -X GET localhost:5001/p2wdb/txid/:txid
    this.router.get('/txid/:txid', this.getByTxid.routeHandler)

    // curl -H "Content-Type: application/json" -X GET localhost:5001/p2wdb/appid/:appid
    this.router.get('/appid/:appid', this.getByAppId.routeHandler)

    // Attach the Controller routes to the Koa app.
    app.use(this.router.routes())
    app.use(this.router.allowedMethods())
  }
}

module.exports = EntryController
