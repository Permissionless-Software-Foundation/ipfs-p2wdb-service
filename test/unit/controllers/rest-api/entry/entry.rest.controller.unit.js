/*
  Unit tests for the REST API handler for the /users endpoints.
*/

// Public npm libraries
const assert = require('chai').assert
const sinon = require('sinon')

// Local support libraries
const adapters = require('../../../mocks/adapters')
const UseCasesMock = require('../../../mocks/use-cases')

const EntryController = require('../../../../../src/controllers/rest-api/entry/controller')
let uut
let sandbox
let ctx

const mockContext = require('../../../../unit/mocks/ctx-mock').context

describe('#Entry-REST-Controller', () => {
  // const testUser = {}

  beforeEach(() => {
    const useCases = new UseCasesMock()
    uut = new EntryController({ adapters, useCases })

    sandbox = sinon.createSandbox()

    // Mock the context object.
    ctx = mockContext()
  })

  afterEach(() => sandbox.restore())

  describe('#constructor', () => {
    it('should throw an error if adapters are not passed in', () => {
      try {
        uut = new EntryController()

        assert.fail('Unexpected code path')
      } catch (err) {
        assert.include(
          err.message,
          'Instance of Adapters library required when instantiating /entry REST Controller.'
        )
      }
    })

    it('should throw an error if useCases are not passed in', () => {
      try {
        uut = new EntryController({ adapters })

        assert.fail('Unexpected code path')
      } catch (err) {
        assert.include(
          err.message,
          'Instance of Use Cases library required when instantiating /entry REST Controller.'
        )
      }
    })
  })

  describe('#POST /entry', () => {
    it('should return 422 status on biz logic error', async () => {
      try {
        await uut.postEntry(ctx)

        assert.fail('Unexpected result')
      } catch (err) {
        // console.log(err)
        assert.equal(err.status, 422)
        assert.include(err.message, 'Cannot read')
      }
    })

    it('should return 200 status on success', async () => {
      ctx.request.body = {
        txid: 'txid',
        signature: 'signature',
        message: 'message',
        data: 'data',
        appId: 'appId'
      }

      await uut.postEntry(ctx)

      // console.log('ctx.response.body: ', ctx.response.body)

      assert.equal(ctx.response.body.success, true)
    })
  })

  describe('#getAll', () => {
    it('body should contain data', async () => {
      await uut.getAll(ctx)
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

        await uut.getAll(ctx)

        assert.fail('Unexpected code path')
      } catch (err) {
        console.log('err: ', err)
        assert.include(err.message, 'test error')
      }
    })
  })

  describe('#getByHash', () => {
    it('body should contain data', async () => {
      ctx.params.hash = 'test'
      await uut.getByHash(ctx)
      // console.log('ctx.body: ', ctx.body)

      assert.equal(ctx.body.success, true)
    })

    it('should catch and throw an error', async () => {
      try {
        // Force an error
        sandbox
          .stub(uut.useCases.entry.readEntry, 'readByHash')
          .rejects(new Error('test error'))

        ctx.params.hash = 'test'
        await uut.getByHash(ctx)

        assert.fail('Unexpected code path')
      } catch (err) {
        assert.include(err.message, 'test error')
      }
    })
  })

  describe('#getByTxid', () => {
    it('body should contain data', async () => {
      ctx.params.txid = 'test'
      await uut.getByTxid(ctx)
      // console.log('ctx.body: ', ctx.body)

      assert.equal(ctx.body.success, true)
    })

    it('should catch and throw an error', async () => {
      try {
        // Force an error
        sandbox
          .stub(uut.useCases.entry.readEntry, 'readByTxid')
          .rejects(new Error('test error'))

        ctx.params.txid = 'test'
        await uut.getByTxid(ctx)

        assert.fail('Unexpected code path')
      } catch (err) {
        assert.include(err.message, 'test error')
      }
    })
  })

  describe('#getByAppId', () => {
    it('body should contain data', async () => {
      ctx.params.appid = 'test'
      await uut.getByAppId(ctx)
      // console.log('ctx.body: ', ctx.body)

      assert.equal(ctx.body.success, true)
    })

    it('should catch and throw an error', async () => {
      try {
        // Force an error
        sandbox
          .stub(uut.useCases.entry.readEntry, 'readByAppId')
          .rejects(new Error('test error'))

        ctx.params.appid = 'test'
        await uut.getByAppId(ctx)

        assert.fail('Unexpected code path')
      } catch (err) {
        assert.include(err.message, 'test error')
      }
    })
  })

  describe('#getPsfCost', () => {
    it('body should contain data', async () => {
      await uut.getPsfCost(ctx)
      // console.log('ctx.body: ', ctx.body)

      assert.equal(ctx.body.success, true)
    })

    it('should catch and throw an error', async () => {
      try {
        // Force an error
        sandbox
          .stub(uut.useCases.entry.cost, 'getPsfCost')
          .rejects(new Error('test error'))

        await uut.getPsfCost(ctx)

        assert.fail('Unexpected code path')
      } catch (err) {
        assert.include(err.message, 'test error')
      }
    })
  })

  describe('#getPsfCostTarget', () => {
    it('body should contain data', async () => {
      // Mock dependencies
      sandbox.stub(uut.useCases.entry.cost, 'getPsfCostTarget').resolves(0.133)

      ctx.request.body = {
        targetDate: '08/01/2022'
      }

      await uut.getPsfCostTarget(ctx)
      // console.log('ctx.body: ', ctx.body)

      assert.equal(ctx.body.success, true)
    })

    it('should catch and throw an error', async () => {
      ctx.request.body = {
        targetDate: '08/01/2022'
      }

      try {
        // Force an error
        sandbox
          .stub(uut.useCases.entry.cost, 'getPsfCostTarget')
          .rejects(new Error('test error'))

        await uut.getPsfCostTarget(ctx)

        assert.fail('Unexpected code path')
      } catch (err) {
        assert.include(err.message, 'test error')
      }
    })

    it('should throw error if targetDate is not included in body', async () => {
      ctx.request.body = {}

      try {
        await uut.getPsfCostTarget(ctx)

        assert.fail('Unexpected code path')
      } catch (err) {
        assert.include(err.message, 'targetDate must be provided')
      }
    })
  })

  describe('#getBchCost', () => {
    it('should throw an error if BCH payments are disabled', async () => {
      uut.config.enableBchPayment = false

      try {
        await uut.getBchCost(ctx)

        assert.fail('Unexpected code path')
      } catch (err) {
        assert.include(err.message, 'BCH payments are not enabled in this instance of P2WDB.')
      }
    })

    it('should return a BCH address and payment amount', async () => {
      uut.config.enableBchPayment = true

      // Mock dependencies
      sandbox.stub(uut.useCases.entry.cost, 'getBchCost').resolves({
        bchCost: 0.0001,
        address: 'bitcoincash:qqsrke9lh257tqen99dkyy2emh4uty0vky9y0z0lsr'
      })

      await uut.getBchCost(ctx)

      assert.equal(ctx.body.success, true)
      assert.equal(ctx.body.bchCost, 0.0001)
      assert.equal(ctx.body.address, 'bitcoincash:qqsrke9lh257tqen99dkyy2emh4uty0vky9y0z0lsr')
    })

    it('should catch and throw errors when retrieving BCH cost', async () => {
      uut.config.enableBchPayment = true

      try {
        sandbox.stub(uut.useCases.entry.cost, 'getBchCost').rejects(new Error('test error'))

        await uut.getBchCost(ctx)

        assert.fail('Unexpected result')
      } catch (err) {
        assert.include(err.message, 'test error')
      }
    })
  })

  describe('#postBchEntry', () => {
    it('should throw an error if BCH payments are disabled', async () => {
      uut.config.enableBchPayment = false

      try {
        await uut.postBchEntry(ctx)

        assert.fail('Unexpected code path')
      } catch (err) {
        assert.include(err.message, 'BCH payments are not enabled in this instance of P2WDB.')
      }
    })

    it('should write an entry paid in BCH', async () => {
      uut.config.enableBchPayment = true

      // Mock dependencies
      sandbox.stub(uut.useCases.entry.addEntry, 'addBchEntry').resolves('fake-hash')

      ctx.request.body = {}

      await uut.postBchEntry(ctx)

      assert.equal(ctx.body.hash, 'fake-hash')
    })
  })

  describe('#handleError', () => {
    it('should include error message', () => {
      try {
        const err = {
          status: 404,
          message: 'test message'
        }

        uut.handleError(ctx, err)
      } catch (err) {
        assert.include(err.message, 'test message')
      }
    })

    it('should still throw error if there is no message', () => {
      try {
        const err = {
          status: 404
        }

        uut.handleError(ctx, err)
      } catch (err) {
        assert.include(err.message, 'Not Found')
      }
    })
  })
})
