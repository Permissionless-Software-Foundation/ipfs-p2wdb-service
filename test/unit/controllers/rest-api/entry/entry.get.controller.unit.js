/*
  Unit tests for the get-all Controller library.
*/

const sinon = require('sinon')
const assert = require('chai').assert

// Unit under test (UUT)
const GetAllEntries = require('../../../../../src/controllers/rest-api/entry/get-all')

// Mocks requred by UUT.
const adapters = require('../../../mocks/adapters')
const UseCasesMock = require('../../../mocks/use-cases')

let uut
let sandbox

describe('#get-all', () => {
  beforeEach(() => {
    const useCases = new UseCasesMock()
    // console.log('useCases: ', useCases)
    uut = new GetAllEntries({ adapters, useCases })

    sandbox = sinon.createSandbox()
  })

  afterEach(() => sandbox.restore())

  describe('#constructor', () => {
    it('should throw an error if adapters not passed in', () => {
      try {
        uut = new GetAllEntries()

        assert.fail('Unexpected code path.')
      } catch (err) {
        assert.include(
          err.message,
          'Instance of Adapters library required when instantiating PostEntry REST Controller.'
        )
      }
    })

    it('should throw an error if use-cases are not passed in', () => {
      try {
        uut = new GetAllEntries({ adapters })

        assert.fail('Unexpected code path.')
      } catch (err) {
        assert.include(
          err.message,
          'Instance of Use Cases library required when instantiating PostEntry REST Controller.'
        )
      }
    })
  })

  describe('#restController', () => {
    it('body should contain data', async () => {
      const ctx = {}
      await uut.restController(ctx)
      // console.log('ctx: ', ctx)

      // Assert that the body data contains the data from the use-case mock.
      assert.property(ctx.body.data, 'key1')
      assert.equal(ctx.body.data.key1, 'value1')
    })

    it('should catch and throw an error', async () => {
      try {
        // Force an error
        sandbox
          .stub(uut.useCases.entry.readEntry, 'readAllEntries')
          .rejects(new Error('test error'))

        await uut.restController()

        assert.fail('Unexpected code path')
      } catch (err) {
        assert.include(err.message, 'test error')
      }
    })
  })
})
