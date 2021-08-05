/*
  Unit tests for the controllers/json-rpc/p2wdb/index.js file.
*/

// Public npm libraries
// const jsonrpc = require('jsonrpc-lite')
const sinon = require('sinon')
const assert = require('chai').assert
// const { v4: uid } = require('uuid')

// Set the environment variable to signal this is a test.
process.env.SVC_ENV = 'test'

// Local libraries
const P2WDBRPC = require('../../../../src/controllers/json-rpc/p2wdb')
const adapters = require('../../mocks/adapters')
const UseCasesMock = require('../../mocks/use-cases')

describe('#P2WDBRPC', () => {
  let uut
  let sandbox
  // let testUser

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
    it('should implement tests', () => {
      assert.equal(1, 1)
    })
  })

  describe('#write', () => {
    it('should return status 200 on successful add', async () => {
      // TODO
      assert.equal(1, 1)
    })

    it('should catch error and return an error object', async () => {
      // TODO
      assert.equal(1, 1)
    })
  })
})
