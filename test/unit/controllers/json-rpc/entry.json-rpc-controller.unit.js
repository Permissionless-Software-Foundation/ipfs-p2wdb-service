/*
  Unit tests for the controllers/json-rpc/p2wdb/index.js file.
*/

// Public npm libraries
const jsonrpc = require('jsonrpc-lite')
const sinon = require('sinon')
const assert = require('chai').assert
const { v4: uid } = require('uuid')

// Set the environment variable to signal this is a test.
process.env.P2W_ENV = 'test'

// Local libraries
const EntryRPC = require('../../../../src/controllers/json-rpc/entry')
const adapters = require('../../mocks/adapters')
const UseCasesMock = require('../../mocks/use-cases')

describe('#ENTRY-JSON-RPC', () => {
  let uut
  let sandbox
  const rpcData = { payload: {} }

  beforeEach(() => {
    sandbox = sinon.createSandbox()

    const useCases = new UseCasesMock()

    uut = new EntryRPC({ adapters, useCases })
  })

  afterEach(() => sandbox.restore())

  describe('#constructor', () => {
    it('should throw an error if adapters are not passed in', () => {
      try {
        uut = new EntryRPC()

        assert.fail('Unexpected code path')
      } catch (err) {
        assert.include(
          err.message,
          'Instance of Adapters library required when instantiating P2WDB JSON RPC Controller.'
        )
      }
    })

    it('should throw an error if useCases are not passed in', () => {
      try {
        uut = new EntryRPC({ adapters })
        console.log(uut)
        assert.fail('Unexpected code path')
      } catch (err) {
        assert.include(
          err.message,
          'Instance of Use Cases library required when instantiating P2WDB JSON RPC Controller.'
        )
      }
    })
  })

  describe('#readAll', () => {
    it('should return status 200 on successful read', async () => {
      rpcData.payload.params = {
        page: 0
      }
      const result = await uut.readAll(rpcData)

      assert.property(result, 'success')
      assert.property(result, 'status')
      assert.property(result, 'endpoint')
      assert.property(result, 'message')
      assert.property(result, 'data')

      assert.isTrue(result.success)
      assert.equal(result.status, 200)
      assert.equal(result.endpoint, 'readAll')
    })

    it('should catch error and return an error object', async () => {
      rpcData.payload = {}
      const result = await uut.readAll(rpcData)

      assert.property(result, 'success')
      assert.property(result, 'status')
      assert.property(result, 'endpoint')
      assert.property(result, 'message')

      assert.isFalse(result.success)
      assert.equal(result.status, 422)
      assert.equal(result.endpoint, 'readAll')
      assert.include(result.message, 'Cannot read')
    })

    it('should throw an error if input is empty', async () => {
      const result = await uut.readAll({})

      assert.property(result, 'success')
      assert.property(result, 'status')
      assert.property(result, 'endpoint')
      assert.property(result, 'message')

      assert.isFalse(result.success)
      assert.equal(result.status, 422)
      assert.equal(result.endpoint, 'readAll')
      assert.include(result.message, 'Cannot read ')
    })
  })

  describe('#write', () => {
    it('should return status 200 on successful add', async () => {
      rpcData.payload.params = {
        txid: 'txid',
        signature: 'signature',
        message: 'message',
        data: 'data'
      }
      const result = await uut.write(rpcData)

      assert.property(result, 'success')
      assert.property(result, 'status')
      assert.property(result, 'endpoint')
      assert.property(result, 'message')
      assert.property(result, 'data')

      assert.isTrue(result.success)
      assert.equal(result.status, 200)
      assert.equal(result.endpoint, 'write')
    })

    it('should catch error and return an error object', async () => {
      rpcData.payload = {}
      const result = await uut.write(rpcData)

      assert.property(result, 'success')
      assert.property(result, 'status')
      assert.property(result, 'endpoint')
      assert.property(result, 'message')

      assert.isFalse(result.success)
      assert.equal(result.status, 422)
      assert.equal(result.endpoint, 'write')
      assert.include(result.message, 'Cannot read')
    })

    it('should throw an error if input is empty', async () => {
      const result = await uut.write({})

      assert.property(result, 'success')
      assert.property(result, 'status')
      assert.property(result, 'endpoint')
      assert.property(result, 'message')

      assert.isFalse(result.success)
      assert.equal(result.status, 422)
      assert.equal(result.endpoint, 'write')
      assert.include(result.message, 'Cannot read')
    })
  })
  describe('#getByHash', () => {
    it('should return status 200 on successful read', async () => {
      rpcData.payload.params = {
        hash: 'hash'
      }
      const result = await uut.getByHash(rpcData)

      assert.property(result, 'success')
      assert.property(result, 'status')
      assert.property(result, 'endpoint')
      assert.property(result, 'message')
      assert.property(result, 'data')

      assert.isTrue(result.success)
      assert.equal(result.status, 200)
      assert.equal(result.endpoint, 'getByHash')
    })

    it('should catch error and return an error object', async () => {
      rpcData.payload = {}
      const result = await uut.getByHash(rpcData)

      assert.property(result, 'success')
      assert.property(result, 'status')
      assert.property(result, 'endpoint')
      assert.property(result, 'message')

      assert.isFalse(result.success)
      assert.equal(result.status, 422)
      assert.equal(result.endpoint, 'getByHash')
      assert.include(result.message, 'Cannot read')
    })

    it('should throw an error if input is empty', async () => {
      const result = await uut.getByHash({})

      assert.property(result, 'success')
      assert.property(result, 'status')
      assert.property(result, 'endpoint')
      assert.property(result, 'message')

      assert.isFalse(result.success)
      assert.equal(result.status, 422)
      assert.equal(result.endpoint, 'getByHash')
      assert.include(result.message, 'Cannot read')
    })
  })
  describe('#getByTxid', () => {
    it('should return status 200 on successful read', async () => {
      rpcData.payload.params = {
        txid: 'txid'
      }
      const result = await uut.getByTxid(rpcData)

      assert.property(result, 'success')
      assert.property(result, 'status')
      assert.property(result, 'endpoint')
      assert.property(result, 'message')
      assert.property(result, 'data')

      assert.isTrue(result.success)
      assert.equal(result.status, 200)
      assert.equal(result.endpoint, 'getByTxid')
    })

    it('should catch error and return an error object', async () => {
      rpcData.payload = {}
      const result = await uut.getByTxid(rpcData)

      assert.property(result, 'success')
      assert.property(result, 'status')
      assert.property(result, 'endpoint')
      assert.property(result, 'message')

      assert.isFalse(result.success)
      assert.equal(result.status, 422)
      assert.equal(result.endpoint, 'getByTxid')
      assert.include(result.message, 'Cannot read')
    })

    it('should throw an error if input is empty', async () => {
      const result = await uut.getByTxid({})

      assert.property(result, 'success')
      assert.property(result, 'status')
      assert.property(result, 'endpoint')
      assert.property(result, 'message')

      assert.isFalse(result.success)
      assert.equal(result.status, 422)
      assert.equal(result.endpoint, 'getByTxid')
      assert.include(result.message, 'Cannot read')
    })
  })

  describe('#getByAppId', () => {
    it('should return status 200 on successful read', async () => {
      rpcData.payload.params = {
        appid: 'appid'
      }
      const result = await uut.getByAppId(rpcData)

      assert.property(result, 'success')
      assert.property(result, 'status')
      assert.property(result, 'endpoint')
      assert.property(result, 'message')
      assert.property(result, 'data')

      assert.isTrue(result.success)
      assert.equal(result.status, 200)
      assert.equal(result.endpoint, 'getByAppId')
    })

    it('should catch error and return an error object', async () => {
      rpcData.payload = {}
      const result = await uut.getByAppId(rpcData)

      assert.property(result, 'success')
      assert.property(result, 'status')
      assert.property(result, 'endpoint')
      assert.property(result, 'message')

      assert.isFalse(result.success)
      assert.equal(result.status, 422)
      assert.equal(result.endpoint, 'getByAppId')
      assert.include(result.message, 'Cannot read')
    })

    it('should throw an error if input is empty', async () => {
      const result = await uut.getByAppId({})

      assert.property(result, 'success')
      assert.property(result, 'status')
      assert.property(result, 'endpoint')
      assert.property(result, 'message')

      assert.isFalse(result.success)
      assert.equal(result.status, 422)
      assert.equal(result.endpoint, 'getByAppId')
      assert.include(result.message, 'Cannot read')
    })
  })

  describe('#entryRouter', () => {
    it('should route to the readAll method', async () => {
      // Mock dependencies
      sandbox.stub(uut, 'readAll').resolves(true)

      // Generate the parsed data that the main router would pass to this
      // endpoint.
      const id = uid()
      const call = jsonrpc.request(id, 'p2wdb', { endpoint: 'readAll' })
      const jsonStr = JSON.stringify(call, null, 2)
      const rpcData = jsonrpc.parse(jsonStr)
      rpcData.from = 'Origin request'

      const result = await uut.entryRouter(rpcData)

      assert.equal(result, true)
    })

    it('should route to the write method', async () => {
      // Mock dependencies
      sandbox.stub(uut, 'write').resolves(true)

      // Generate the parsed data that the main router would pass to this
      // endpoint.
      const id = uid()
      const call = jsonrpc.request(id, 'p2wdb', { endpoint: 'write' })
      const jsonStr = JSON.stringify(call, null, 2)
      const rpcData = jsonrpc.parse(jsonStr)
      rpcData.from = 'Origin request'

      const result = await uut.entryRouter(rpcData)

      assert.equal(result, true)
    })

    it('should route to the getByHash method', async () => {
      // Mock dependencies
      sandbox.stub(uut, 'getByHash').resolves(true)

      // Generate the parsed data that the main router would pass to this
      // endpoint.
      const id = uid()
      const call = jsonrpc.request(id, 'p2wdb', { endpoint: 'getByHash' })
      const jsonStr = JSON.stringify(call, null, 2)
      const rpcData = jsonrpc.parse(jsonStr)
      rpcData.from = 'Origin request'

      const result = await uut.entryRouter(rpcData)

      assert.equal(result, true)
    })

    it('should route to the getByTxid method', async () => {
      // Mock dependencies
      sandbox.stub(uut, 'getByTxid').resolves(true)

      // Generate the parsed data that the main router would pass to this
      // endpoint.
      const id = uid()
      const call = jsonrpc.request(id, 'p2wdb', { endpoint: 'getByTxid' })
      const jsonStr = JSON.stringify(call, null, 2)
      const rpcData = jsonrpc.parse(jsonStr)
      rpcData.from = 'Origin request'

      const result = await uut.entryRouter(rpcData)

      assert.equal(result, true)
    })

    it('should route to the getByAppId method', async () => {
      // Mock dependencies
      sandbox.stub(uut, 'getByAppId').resolves(true)

      // Generate the parsed data that the main router would pass to this
      // endpoint.
      const id = uid()
      const call = jsonrpc.request(id, 'p2wdb', { endpoint: 'getByAppId' })
      const jsonStr = JSON.stringify(call, null, 2)
      const rpcData = jsonrpc.parse(jsonStr)
      rpcData.from = 'Origin request'

      const result = await uut.entryRouter(rpcData)

      assert.equal(result, true)
    })

    // it('should route to the getAllUsers method', async () => {
    //   // Mock dependencies
    //   sandbox.stub(uut, 'getAll').resolves(true)
    //
    //   // Generate the parsed data that the main router would pass to this
    //   // endpoint.
    //   const id = uid()
    //   const userCall = jsonrpc.request(id, 'users', {
    //     endpoint: 'getAllUsers',
    //     apiToken: testUser.token
    //   })
    //   const jsonStr = JSON.stringify(userCall, null, 2)
    //   const rpcData = jsonrpc.parse(jsonStr)
    //   rpcData.from = 'Origin request'
    //
    //   // Force middleware to pass.
    //   sandbox.stub(uut.validators, 'ensureUser').resolves(true)
    //
    //   const result = await uut.userRouter(rpcData)
    //   // console.log('result', result)
    //   assert.equal(result, true)
    // })

    // it('should route to the updateUser method', async () => {
    //   // Mock dependencies
    //   sandbox.stub(uut, 'updateUser').resolves(true)
    //
    //   // Generate the parsed data that the main router would pass to this
    //   // endpoint.
    //   const id = uid()
    //   const userCall = jsonrpc.request(id, 'users', {
    //     endpoint: 'updateUser',
    //     apiToken: 'fakeJWTToken',
    //     userId: 'abc123'
    //   })
    //   const jsonStr = JSON.stringify(userCall, null, 2)
    //   const rpcData = jsonrpc.parse(jsonStr)
    //   rpcData.from = 'Origin request'
    //
    //   // Force middleware to pass.
    //   sandbox.stub(uut.validators, 'ensureTargetUserOrAdmin').resolves(true)
    //
    //   const result = await uut.userRouter(rpcData)
    //   // console.log('result: ', result)
    //
    //   assert.equal(result, true)
    // })

    // it('should route to the getUser method', async () => {
    //   // Mock dependencies
    //   sandbox.stub(uut, 'getUser').resolves(true)
    //
    //   // Generate the parsed data that the main router would pass to this
    //   // endpoint.
    //   const id = uid()
    //   const userCall = jsonrpc.request(id, 'users', {
    //     endpoint: 'getUser',
    //     apiToken: testUser.token
    //   })
    //   const jsonStr = JSON.stringify(userCall, null, 2)
    //   const rpcData = jsonrpc.parse(jsonStr)
    //   rpcData.from = 'Origin request'
    //
    //   // Force middleware to pass.
    //   sandbox.stub(uut.validators, 'ensureUser').resolves(true)
    //
    //   const result = await uut.userRouter(rpcData)
    //   // console.log('result: ', result)
    //
    //   assert.equal(result, true)
    // })

    // it('should route to the deleteUsers method', async () => {
    //   // Mock dependencies
    //   sandbox.stub(uut, 'deleteUser').resolves(true)
    //
    //   // Generate the parsed data that the main router would pass to this
    //   // endpoint.
    //   const id = uid()
    //   const userCall = jsonrpc.request(id, 'users', {
    //     endpoint: 'deleteUser',
    //     apiToken: 'fakeJWTToken',
    //     userId: 'abc123'
    //   })
    //   const jsonStr = JSON.stringify(userCall, null, 2)
    //   const rpcData = jsonrpc.parse(jsonStr)
    //   rpcData.from = 'Origin request'
    //
    //   // Force middleware to pass.
    //   sandbox.stub(uut.validators, 'ensureTargetUserOrAdmin').resolves(true)
    //
    //   const result = await uut.userRouter(rpcData)
    //   // console.log('result: ', result)
    //
    //   assert.equal(result, true)
    // })

    it('should return 500 status on routing issue', async () => {
      // Force an error
      sandbox.stub(uut, 'readAll').rejects(new Error('test error'))

      // Generate the parsed data that the main router would pass to this
      // endpoint.
      const id = uid()
      const call = jsonrpc.request(id, 'p2wdb', { endpoint: 'readAll' })
      const jsonStr = JSON.stringify(call, null, 2)
      const rpcData = jsonrpc.parse(jsonStr)
      rpcData.from = 'Origin request'

      const result = await uut.entryRouter(rpcData)
      // console.log('result: ', result)

      assert.equal(result.success, false)
      assert.equal(result.status, 500)
      assert.equal(result.message, 'test error')
      assert.equal(result.endpoint, 'readAll')
    })
  })
})
