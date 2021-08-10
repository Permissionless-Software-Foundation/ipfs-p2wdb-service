/*
  Unit tests for the controllers/json-rpc/p2wdb/index.js file.
*/

// Public npm libraries
// const jsonrpc = require('jsonrpc-lite')
const sinon = require('sinon')
const assert = require('chai').assert
// const { v4: uid } = require('uuid')

// Set the environment variable to signal this is a test.
process.env.P2W_ENV = 'test'

// Local libraries
const P2WDBRPC = require('../../../../src/controllers/json-rpc/p2wdb')
const adapters = require('../../mocks/adapters')
const UseCasesMock = require('../../mocks/use-cases')

describe('#P2WDBRPC', () => {
  let uut
  let sandbox
  const rpcData = { payload: {} }

  beforeEach(() => {
    sandbox = sinon.createSandbox()

    const useCases = new UseCasesMock()

    uut = new P2WDBRPC({ adapters, useCases })
  })

  afterEach(() => sandbox.restore())

  describe('#constructor', () => {
    it('should throw an error if adapters are not passed in', () => {
      try {
        uut = new P2WDBRPC()

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
        uut = new P2WDBRPC({ adapters })
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

  // TODO
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
      assert.include(result.message, 'Cannot read property')
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
      assert.include(result.message, 'Cannot read property')
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
      assert.include(result.message, 'Cannot read property')
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
      assert.include(result.message, 'Cannot read property')
    })
  })
})
