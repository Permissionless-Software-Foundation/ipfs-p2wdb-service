/*
  Unit tests for the REST API handler for the /users endpoints.
*/

// Public npm libraries
const assert = require('chai').assert
const sinon = require('sinon')

// Local support libraries
const adapters = require('../../../mocks/adapters')
const UseCasesMock = require('../../../mocks/use-cases')

const WebhookController = require('../../../../../src/controllers/rest-api/webhook/controller')
let uut
let sandbox
let ctx
let webhookData = {}

const mockContext = require('../../../../unit/mocks/ctx-mock').context

describe('#Webhook-REST-Controller', () => {
  // const testUser = {}

  beforeEach(() => {
    const useCases = new UseCasesMock()
    uut = new WebhookController({ adapters, useCases })

    sandbox = sinon.createSandbox()

    webhookData = {
      url: 'http://test.com',
      appId: 'test'
    }

    // Mock the context object.
    ctx = mockContext()
  })

  afterEach(() => sandbox.restore())

  describe('#constructor', () => {
    it('should throw an error if adapters are not passed in', () => {
      try {
        uut = new WebhookController()

        assert.fail('Unexpected code path')
      } catch (err) {
        assert.include(
          err.message,
          'Instance of Adapters library required when instantiating /webhook REST Controller.'
        )
      }
    })

    it('should throw an error if useCases are not passed in', () => {
      try {
        uut = new WebhookController({ adapters })

        assert.fail('Unexpected code path')
      } catch (err) {
        assert.include(
          err.message,
          'Instance of Use Cases library required when instantiating /webhook REST Controller.'
        )
      }
    })
  })

  describe('#postWebhook', () => {
    it('body should contain data', async () => {
      // Mock dependencies
      sandbox
        .stub(uut.useCases.webhook.addWebhook, 'addNewWebhook')
        .resolves('123')

      ctx.request = {
        body: webhookData
      }

      await uut.postWebhook(ctx)
      // console.log('ctx: ', ctx)

      // Assert that the body data contains the data from the use-case mock.
      assert.property(ctx.body, 'success')
      assert.equal(ctx.body.success, true)
      assert.property(ctx.body, 'id')
      assert.equal(ctx.body.id, '123')
    })

    it('should catch and throw an error', async () => {
      try {
        // Force an error
        sandbox
          .stub(uut.useCases.webhook.addWebhook, 'addNewWebhook')
          .rejects(new Error('test error'))

        ctx.request = {
          body: webhookData
        }

        await uut.postWebhook(ctx)

        assert.fail('Unexpected code path')
      } catch (err) {
        assert.include(err.message, 'test error')
      }
    })
  })

  describe('#deleteWebhook', () => {
    it('body should contain data', async () => {
      // Mock dependencies
      sandbox.stub(uut.useCases.webhook, 'remove').resolves('123')

      ctx.request = {
        body: webhookData
      }

      await uut.deleteWebhook(ctx)
      // console.log('ctx: ', ctx)

      // Assert that the body data contains the data from the use-case mock.
      assert.property(ctx.body, 'success')
      assert.equal(ctx.body.success, '123')
    })

    it('should catch and throw an error', async () => {
      try {
        // Force an error
        sandbox
          .stub(uut.useCases.webhook, 'remove')
          .rejects(new Error('test error'))

        ctx.request = {
          body: webhookData
        }

        await uut.deleteWebhook(ctx)

        assert.fail('Unexpected code path')
      } catch (err) {
        assert.include(err.message, 'test error')
      }
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
