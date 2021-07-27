/*
  REST API Controller library for the /entry route
*/

const { wlogger } = require('../../../adapters/wlogger')

let _this

class EntryRESTControllerLib {
  constructor (localConfig = {}) {
    // Dependency Injection.
    this.adapters = localConfig.adapters
    if (!this.adapters) {
      throw new Error(
        'Instance of Adapters library required when instantiating /entry REST Controller.'
      )
    }
    this.useCases = localConfig.useCases
    if (!this.useCases) {
      throw new Error(
        'Instance of Use Cases library required when instantiating /entry REST Controller.'
      )
    }

    // Encapsulate dependencies
    // this.UserModel = this.adapters.localdb.Users
    // this.userUseCases = this.useCases.user

    _this = this
  }

  /**
   * @api {post} /p2wdb Write
   * @apiPermission public
   * @apiName P2WDB Write
   * @apiGroup REST P2WDB
   *
   * @apiExample Example usage:
   * curl -H "Content-Type: application/json" -X POST -d '{ "txid": "9ac06c53c158430ea32a587fb4e2bc9e947b1d8c6ff1e4cc02afa40d522d7967", "message": "test", "signature": "H+TgPR/6Fxlo2uDb9UyQpWENBW1xtQvM2+etWlSmc+1kIeZtyw7HCsYMnf8X+EdP0E+CUJwP37HcpVLyKly2XKg=", "data": "This is the data that will go into the database." }' localhost:5001/p2wdb
   *
   * @apiDescription
   * Write a new entry to the database.
   *
   * @apiError UnprocessableEntity Missing required parameters
   *
   * @apiErrorExample {json} Error-Response:
   *     HTTP/1.1 422 Unprocessable Entity
   *     {
   *       "status": 422,
   *       "error": "Unprocessable Entity"
   *     }
   */
  async postEntry (ctx) {
    try {
      const txid = ctx.request.body.txid
      const signature = ctx.request.body.signature
      const message = ctx.request.body.message
      const data = ctx.request.body.data
      const appId = ctx.request.body.appId

      const writeObj = { txid, signature, message, data, appId }
      console.log(`body data: ${JSON.stringify(writeObj, null, 2)}`)

      // const hash = await this.addEntry.addUserEntry(writeObj)
      const hash = await this.useCases.entry.addEntry.addUserEntry(writeObj)

      ctx.body = {
        success: true,
        hash
      }
    } catch (err) {
      // console.log('Error in post-entry.js/restController(): ', err)
      // throw err
      _this.handleError(ctx, err)
    }
  }

  /**
   * @api {get} /p2wdb Read All
   * @apiPermission public
   * @apiName P2WDB Read All
   * @apiGroup REST P2WDB
   *
   * @apiExample Example usage:
   * curl -H "Content-Type: application/json" -X GET localhost:5001/entry/all
   *
   * @apiDescription
   * Read all the entries from the database.
   *
   * @apiError UnprocessableEntity Missing required parameters
   *
   * @apiErrorExample {json} Error-Response:
   *     HTTP/1.1 422 Unprocessable Entity
   *     {
   *       "status": 422,
   *       "error": "Unprocessable Entity"
   *     }
   */
  async getAll (ctx) {
    try {
      // console.log('this.useCases.entry: ', this.useCases.entry)

      // Get all the contents of the P2WDB.
      const allData = await this.useCases.entry.readEntry.readAllEntries()

      ctx.body = {
        success: true,
        data: allData
      }
    } catch (err) {
      // console.log('Error in get-all.js/restController()')
      // throw err
      _this.handleError(ctx, err)
    }
  }

  /**
   * @api {get} /p2wdb Read By Hash
   * @apiPermission public
   * @apiName P2WDB Read By Hash
   * @apiGroup REST P2WDB
   *
   * @apiExample Example usage:
   * curl -H "Content-Type: application/json" -X GET localhost:5001/p2wdb/hash/:hash
   *
   * @apiDescription
   * Read all the entries from the database.
   *
   * @apiError UnprocessableEntity Missing required parameters
   *
   * @apiErrorExample {json} Error-Response:
   *     HTTP/1.1 422 Unprocessable Entity
   *     {
   *       "status": 422,
   *       "error": "Unprocessable Entity"
   *     }
   */
  async getByHash (ctx) {
    try {
      const hash = ctx.params.hash
      console.log(hash)

      // Get all the contents of the P2WDB.
      const allData = await this.useCases.entry.readEntry.readByHash(hash)

      ctx.body = {
        success: true,
        data: allData
      }
    } catch (err) {
      // console.log('Error in get-by-hash.js/restController(): ', err)
      // throw err
      _this.handleError(ctx, err)
    }
  }

  /**
   * @api {get} /p2wdb Read By TXID
   * @apiPermission public
   * @apiName P2WDB Read By TXID
   * @apiGroup REST P2WDB
   *
   * @apiExample Example usage:
   * curl -H "Content-Type: application/json" -X GET localhost:5001/p2wdb/txid/:txid
   *
   * @apiDescription
   * Read an entry from the P2WDB if it matches the TXID.
   *
   * @apiError UnprocessableEntity Missing required parameters
   *
   * @apiErrorExample {json} Error-Response:
   *     HTTP/1.1 422 Unprocessable Entity
   *     {
   *       "status": 422,
   *       "error": "Unprocessable Entity"
   *     }
   */
  async getByTxid (ctx) {
    try {
      const txid = ctx.params.txid
      // console.log(ctx.params)

      // Get all the contents of the P2WDB.
      const allData = await this.useCases.entry.readEntry.readByTxid(txid)

      ctx.body = {
        success: true,
        data: allData
      }
    } catch (err) {
      // console.log('Error in get-by-txid.js/restController(): ', err)
      // throw err
      _this.handleError(ctx, err)
    }
  }

  /**
   * @api {get} /p2wdb Read By App ID
   * @apiPermission public
   * @apiName P2WDB Read By App ID
   * @apiGroup REST P2WDB
   *
   * @apiExample Example usage:
   * curl -H "Content-Type: application/json" -X GET localhost:5001/p2wdb/appid/test
   *
   * @apiDescription
   * Read all the entries from the database.
   *
   * @apiError UnprocessableEntity Missing required parameters
   *
   * @apiErrorExample {json} Error-Response:
   *     HTTP/1.1 422 Unprocessable Entity
   *     {
   *       "status": 422,
   *       "error": "Unprocessable Entity"
   *     }
   */
  async getByAppId (ctx) {
    try {
      const appId = ctx.params.appid
      // console.log(ctx.params)

      // Get all the contents of the P2WDB.
      const allData = await this.useCases.entry.readEntry.readByAppId(appId)

      ctx.body = {
        success: true,
        data: allData
      }
    } catch (err) {
      // console.log('Error in get-by-appid.js/restController(): ', err)
      // throw err
      _this.handleError(ctx, err)
    }
  }

  // DRY error handler
  handleError (ctx, err) {
    // If an HTTP status is specified by the buisiness logic, use that.
    if (err.status) {
      if (err.message) {
        ctx.throw(err.status, err.message)
      } else {
        ctx.throw(err.status)
      }
    } else {
      // By default use a 422 error if the HTTP status is not specified.
      ctx.throw(422, err.message)
    }
  }
}

module.exports = EntryRESTControllerLib
