/*
  Clean Architecture Controller for the GET all Entries that match an appId.
*/

let _this

class GetByAppId {
  constructor (localConfig = {}) {
    // Dependency Injection.
    this.adapters = localConfig.adapters
    if (!this.adapters) {
      throw new Error(
        'Instance of Adapters library required when instantiating GetByAppId REST Controller.'
      )
    }
    this.useCases = localConfig.useCases
    if (!this.useCases) {
      throw new Error(
        'Instance of Use Cases library required when instantiating GetByAppId REST Controller.'
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
  async restController (ctx) {
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
      console.log('Error in get-by-appid.js/restController(): ', err)
      throw err
    }
  }
}

module.exports = GetByAppId
