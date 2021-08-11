/*
  This is the JSON RPC router for the P2WDB API.

  TODO:
   - Unit and integration tests needed.
*/

// Public npm libraries
// const jsonrpc = require('jsonrpc-lite')

// Local libraries
const { wlogger } = require('../../../adapters/wlogger')

class EntryRPC {
  constructor (localConfig = {}) {
    // Dependency Injection.
    this.adapters = localConfig.adapters
    if (!this.adapters) {
      throw new Error(
        'Instance of Adapters library required when instantiating P2WDB JSON RPC Controller.'
      )
    }
    this.useCases = localConfig.useCases
    if (!this.useCases) {
      throw new Error(
        'Instance of Use Cases library required when instantiating P2WDB JSON RPC Controller.'
      )
    }
  }

  async entryRouter (rpcData) {
    let endpoint = 'unknown' // Default value.

    try {
      // console.log('authRouter rpcData: ', rpcData)

      endpoint = rpcData.payload.params.endpoint

      // Route the call based on the requested endpoint.
      switch (endpoint) {
        case 'readAll':
          // await this.rateLimit.limiter(rpcData.from)
          return await this.readAll(rpcData)

        case 'write':
          return await this.write(rpcData)

        case 'getByHash':
          return await this.getByHash(rpcData)

        case 'getByTxid':
          return await this.getByTxid(rpcData)

        case 'getByAppId':
          return await this.getByAppId(rpcData)
      }
    } catch (err) {
      console.error('Error in EntryRPC/entryRouter()')
      // throw err

      return {
        success: false,
        status: 500,
        message: err.message,
        endpoint
      }
    }
  }

  /**
   * @api {JSON} /p2wdb Read All
   * @apiPermission public
   * @apiName P2WDB Read All
   * @apiGroup JSON P2WDB
   *
   * @apiExample Example usage:
   * {"jsonrpc":"2.0","id":"555","method":"p2wdb","params":{"endpoint": "readAll", "page": 0}}
   *
   * @apiDescription
   * Read all entries in the database.
   */
  // Read all entries from the P2WDB.
  // {"jsonrpc":"2.0","id":"555","method":"p2wdb","params":{"endpoint": "readAll", "page": 0}}
  async readAll (rpcData) {
    try {
      console.log('P2WDB readAll() RPC endpoint called.')
      // console.log('this.useCases: ', this.useCases)

      const page = rpcData.payload.params.page

      // Get all the contents of the P2WDB.
      const allData = await this.useCases.entry.readEntry.readAllEntries(page)

      const response = {
        endpoint: 'readAll',
        status: 200,
        success: true,
        message: '',
        data: allData
      }

      wlogger.debug(`Returning response: ${JSON.stringify(response, null, 2)}`)

      return response
    } catch (err) {
      // console.error('Error in authUser()')
      wlogger.error('Error in EntryRPC/readAll(): ', err)
      // throw err

      // Return an error response
      return {
        success: false,
        status: 422,
        message: err.message,
        endpoint: 'readAll'
      }
    }
  }

  /**
   * @api {JSON} /p2wdb Write
   * @apiPermission public
   * @apiName P2WDB Write
   * @apiGroup JSON P2WDB
   *
   * @apiExample Example usage:
   * {"jsonrpc":"2.0","id":"555","method":"p2wdb","params":{"endpoint": "write", "txid": "9ac06c53c158430ea32a587fb4e2bc9e947b1d8c6ff1e4cc02afa40d522d7967", "message": "test", "signature": "H+TgPR/6Fxlo2uDb9UyQpWENBW1xtQvM2+etWlSmc+1kIeZtyw7HCsYMnf8X+EdP0E+CUJwP37HcpVLyKly2XKg=", "data": "This is the data that will go into the database."}}
   *
   * @apiDescription
   * Write a new entry to the database.
   */
  // (attempt to) write an entry to the P2WDB.
  // {"jsonrpc":"2.0","id":"555","method":"p2wdb","params":{"endpoint": "write", "txid": "23a104c012c912c351e61a451c387e511f65d115fa79bb5038f4e6bac811754a", "message": "test", "signature": "ID1G37GgWc2MugZHzNss53mMQPT0Mebix6erYC/Qlc+PaJqZaMfjK59KXPDF5wJWlHjcK8hpVbly/5SBAspR54o="}}
  async write (rpcData) {
    try {
      console.log('P2WDB write() RPC endpoint called.')

      const txid = rpcData.payload.params.txid
      const signature = rpcData.payload.params.signature
      const message = rpcData.payload.params.message
      const data = rpcData.payload.params.data

      const writeObj = { txid, signature, message, data }
      console.log(`writeObj: ${JSON.stringify(writeObj, null, 2)}`)

      const hash = await this.useCases.entry.addEntry.addUserEntry(writeObj)

      // const result = await p2wdb.write(writeObj)

      const response = {
        endpoint: 'write',
        status: 200,
        success: true,
        message: '',
        data: hash
      }

      wlogger.debug(`Returning response: ${JSON.stringify(response, null, 2)}`)

      return response
    } catch (err) {
      // console.error('Error in authUser()')
      wlogger.error('Error in EntryRPC/write(): ', err)
      // throw err

      // Return an error response
      return {
        success: false,
        status: 422,
        message: err.message,
        endpoint: 'write'
      }
    }
  }
  /**
   * @api {JSON} /p2wdb Get by Hash
   * @apiPermission public
   * @apiName P2WDB Get by Hash
   * @apiGroup JSON P2WDB
   *
   * @apiExample Example usage:
   * {"jsonrpc":"2.0","id":"555","method":"p2wdb","params":{"endpoint": "getByHash", "hash": "hash"}}
   *
   * @apiDescription
   * Read entries by hash in the database.
   */
  // Read entries by hash from P2WDB.
  // {"jsonrpc":"2.0","id":"555","method":"p2wdb","params":{"endpoint": "getByHash", "hash": "hash"}}

  async getByHash (rpcData) {
    try {
      const hash = rpcData.payload.params.hash
      // console.log('hash: ', hash)

      // Get all the contents of the P2WDB.
      const allData = await this.useCases.entry.readEntry.readByHash(hash)

      const response = {
        endpoint: 'getByHash',
        status: 200,
        success: true,
        message: '',
        data: allData
      }

      return response
    } catch (err) {
      // console.error('Error in authUser()')
      wlogger.error('Error in EntryRPC/getByHash(): ', err)
      // Return an error response
      return {
        success: false,
        status: 422,
        message: err.message,
        endpoint: 'getByHash'
      }
    }
  }
  /**
   * @api {JSON} /p2wdb Get by Txid
   * @apiPermission public
   * @apiName P2WDB Get by Txid
   * @apiGroup JSON P2WDB
   *
   * @apiExample Example usage:
   * {"jsonrpc":"2.0","id":"555","method":"p2wdb","params":{"endpoint": "getByTxid", "txid": "txid"}}
   *
   * @apiDescription
   * Read entries by hash in the database.
   */
  // Read entries by hash from P2WDB.
  // {"jsonrpc":"2.0","id":"555","method":"p2wdb","params":{"endpoint": "getByTxid", "txid": "txid"}}

  async getByTxid (rpcData) {
    try {
      const txid = rpcData.payload.params.txid
      // console.log(ctx.params)

      // Get all the contents of the P2WDB.
      const allData = await this.useCases.entry.readEntry.readByTxid(txid)

      const response = {
        endpoint: 'getByTxid',
        status: 200,
        success: true,
        message: '',
        data: allData
      }
      return response
    } catch (err) {
      // console.error('Error in authUser()')
      wlogger.error('Error in EntryRPC/getByTxid(): ', err)
      // Return an error response
      return {
        success: false,
        status: 422,
        message: err.message,
        endpoint: 'getByTxid'
      }
    }
  }
  /**
   * @api {JSON} /p2wdb Get by Appid
   * @apiPermission public
   * @apiName P2WDB Get by Appid
   * @apiGroup JSON P2WDB
   *
   * @apiExample Example usage:
   * {"jsonrpc":"2.0","id":"555","method":"p2wdb","params":{"endpoint": "getByAppId", "appid": "appid"}}
   *
   * @apiDescription
   * Read entries by hash in the database.
   */
  // Read entries by hash from P2WDB.
  // {"jsonrpc":"2.0","id":"555","method":"p2wdb","params":{"endpoint": "getByAppId", "appid": "appid"}}

  async getByAppId (rpcData) {
    try {
      const appId = rpcData.payload.params.appid
      // console.log(ctx.params)

      // Get all the contents of the P2WDB.
      const allData = await this.useCases.entry.readEntry.readByAppId(appId)

      const response = {
        endpoint: 'getByAppId',
        status: 200,
        success: true,
        message: '',
        data: allData
      }
      return response
    } catch (err) {
      wlogger.error('Error in EntryRPC/getByAppId(): ', err)
      // Return an error response
      return {
        success: false,
        status: 422,
        message: err.message,
        endpoint: 'getByAppId'
      }
    }
  }
}

module.exports = EntryRPC
