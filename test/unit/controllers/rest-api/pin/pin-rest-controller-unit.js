/*
  Unit tests for the REST API handler for the /users endpoints.
*/

// Public npm libraries
import { assert } from 'chai'
import sinon from 'sinon'

// Local support libraries
import adapters from '../../../mocks/adapters/index.js'
import UseCasesMock from '../../../mocks/use-cases/index.js'
import PinJsonRESTController from '../../../../../src/controllers/rest-api/pin/controller.js'

import { context as mockContext } from '../../../../unit/mocks/ctx-mock.js'
let uut
let sandbox
let ctx

describe('#Pin-REST-Controller', () => {
  // const testUser = {}

  beforeEach(() => {
    const useCases = new UseCasesMock()
    uut = new PinJsonRESTController({ adapters, useCases })

    sandbox = sinon.createSandbox()

    // Mock the context object.
    ctx = mockContext()
  })

  afterEach(() => sandbox.restore())

  describe('#constructor', () => {
    it('should throw an error if adapters are not passed in', () => {
      try {
        uut = new PinJsonRESTController()

        assert.fail('Unexpected code path')
      } catch (err) {
        assert.include(
          err.message,
          'Instance of Adapters library required when instantiating /pin REST Controller.'
        )
      }
    })

    it('should throw an error if useCases are not passed in', () => {
      try {
        uut = new PinJsonRESTController({ adapters })

        assert.fail('Unexpected code path')
      } catch (err) {
        assert.include(
          err.message,
          'Instance of Use Cases library required when instantiating /pin REST Controller.'
        )
      }
    })
  })

  describe('#POST /pin/json', () => {
    it('should pin the JSON inside a given zcid', async () => {
      // Mock dependencies and force desired code path.
      sandbox.stub(uut.useCases.pin, 'pinJson').resolves('fake-cid')

      ctx.request.body = {
        zcid: 'fake-zcid'
      }

      await uut.pinJson(ctx)
      // console.log('ctx.body: ', ctx.body)
      // console.log('ctx.response.body: ', ctx.response.body)

      // Assert the expected HTTP response
      assert.equal(ctx.status, 200)
      assert.equal(ctx.response.body.success, true)
      assert.equal(ctx.response.body.cid, 'fake-cid')
    })

    it('should return 422 status on biz logic error', async () => {
      try {
        await uut.pinJson(ctx)

        assert.fail('Unexpected result')
      } catch (err) {
        // console.log(err)
        assert.equal(err.status, 422)
        assert.include(err.message, 'Cannot read')
      }
    })

    it('should return 422 status if zcid is not included', async () => {
      try {
        ctx.request.body = {}

        await uut.pinJson(ctx)

        assert.fail('Unexpected result')
      } catch (err) {
        // console.log(err)
        assert.equal(err.status, 422)
        assert.include(err.message, 'P2WDB CID must be included with property zcid')
      }
    })
  })
})
