/*
  Clean Architecture Controller for the GET all Entries.
*/

let _this

class GetAllEntries {
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
   * @api {get} /p2wdb Read All
   * @apiPermission public
   * @apiName P2WDB Read All
   * @apiGroup REST P2WDB
   *
   * @apiExample Example usage:
   * curl -H "Content-Type: application/json" -X GET localhost:5001/p2wdb/all
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
      // console.log('this.useCases.entry: ', this.useCases.entry)

      // Get all the contents of the P2WDB.
      const allData = await this.useCases.entry.readEntry.readAllEntries()

      ctx.body = {
        success: true,
        data: allData
      }
    } catch (err) {
      console.log('Error in get-all.js/restController()')
      throw err
    }
  }
}

module.exports = GetAllEntries
