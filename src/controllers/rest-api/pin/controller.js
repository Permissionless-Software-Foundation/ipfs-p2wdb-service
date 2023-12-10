/*
  REST API Controller library for the /pin route
  This route handles incoming data for pinning content with the Helia IPFS node.
*/

// Local libraries
import config from '../../../../config/index.js'

// const { wlogger } = require('../../../adapters/wlogger')

// Hack to get __dirname back.
// https://blog.logrocket.com/alternatives-dirname-node-js-es-modules/
// import * as url from 'url'
// const __dirname = url.fileURLToPath(new URL('.', import.meta.url))

class PinRESTControllerLib {
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

    // this.serverURL = 'http://localhost:5010'
    this.serverURL = config.p2wdbServerUrl

    // bind 'this' object to event handlers
    this.handleError = this.handleError.bind(this)
    this.pinJson = this.pinJson.bind(this)
    // this.getJsonFromP2wdb = this.getJsonFromP2wdb.bind(this)
  }

  /**
     * @api {post} /pin/json Pin JSON
     * @apiPermission public
     * @apiName Pin JSON
     * @apiGroup Pin
     *
     * @apiDescription
     * Retrieve a JSON entry from the P2WDB, convert it to a file, and pin it
     * to the IPFS node.
     *
     * @apiExample Example usage:
     * curl -H "Content-Type: application/json" -X POST -d '{ "zcid": "zdpuB31nSGKrbA7jDvXSPVriYA8paG9Xf9BGEmkWP4omzSMK3" }' localhost:5667/pin/json
     *
     * @apiSuccessExample {json} Success-Response:
     *     HTTP/1.1 200 OK
     *     {
     *        "success":true,
     *        "cid": "bafybeigqngf3srkggq27c6eomjha4tjy2faigbkagk6vrlj5qnjj3ctvgu"
     *     }
     *
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
  async pinJson (ctx) {
    try {
      console.log('pin-json REST API handler body: ', ctx.request.body)
      /*
        Example input for pinning a JSON object:

        typical body:  {
          zcid: 'zdpuAqc2yMsrdM39gDyhhoCSPpoceGjaTJforddKhaGjBjVUD'
        }
      */

      const zcid = ctx.request.body.zcid
      if (!zcid) {
        throw new Error('P2WDB CID must be included with property zcid')
      }

      const cid = await this.useCases.pin.pinJson(zcid)

      const status = true

      ctx.body = {
        success: status,
        cid
      }
    } catch (err) {
      // console.log(`err.message: ${err.message}`)
      // console.log('err: ', err)
      // ctx.throw(422, err.message)
      this.handleError(ctx, err)
    }
  }

  // DRY error handler
  handleError (ctx, err) {
    console.log('err', err)

    // If an HTTP status is specified by the buisiness logic, use that.
    // if (err.status) {
    //   if (err.message) {
    //     ctx.throw(err.status, err.message)
    //   } else {
    //     ctx.throw(err.status)
    //   }
    // } else {
    // By default use a 422 error if the HTTP status is not specified.
    ctx.throw(422, err.message)
    // }
  }
}

export default PinRESTControllerLib
