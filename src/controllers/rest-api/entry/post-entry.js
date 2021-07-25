/*
  Clean Architecture Controller for the POST Entry.
*/

let _this

class PostEntry {
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

    _this = this
  }

  async routeHandler (ctx, next) {
    try {
      await _this.restController(ctx)
    } catch (err) {
      // console.error('Error in POST /temp/write controller')
      ctx.throw(422, err.message)
    }
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
  async restController (ctx) {
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
      console.log('Error in post-entry.js/restController(): ', err)
      throw err
    }
  }
}

module.exports = PostEntry
