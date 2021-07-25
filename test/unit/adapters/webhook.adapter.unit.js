/*
  Unit tests for the Webhook Adapter
*/

const sinon = require('sinon')
const assert = require('chai').assert

const WebhookAdapter = require('../../../src/adapters/webhook')

describe('#WebhookAdapter', () => {
  let uut
  let sandbox

  beforeEach(() => {
    uut = new WebhookAdapter()

    sandbox = sinon.createSandbox()
  })

  afterEach(() => sandbox.restore())

  describe('#validationSucceededEventHandler', () => {
    it('should exit quietly if data can not be parsed into JSON', async () => {
      const eventData = {
        data: 'some data'
      }

      await uut.validationSucceededEventHandler(eventData)

      // Not throwing an error is a pass.
      // Looking at the code coverage report is how to check if this test case
      // is working properly.
      assert.equal(1, 1)
    })

    it('should exit quietly if data does not contain an appID', async () => {
      const eventData = {
        data: '{"title":"83214","sourceUrl":"69834"}'
      }

      await uut.validationSucceededEventHandler(eventData)

      // Not throwing an error is a pass.
      // Looking at the code coverage report is how to check if this test case
      // is working properly.
      assert.equal(1, 1)
    })

    it('should trigger a webhook if one exists in the database with a matching appID', async () => {
      const eventData = {
        data: '{"appId":"test","title":"83214","sourceUrl":"69834"}'
      }

      // Mock dependendent functions
      // Force the database to return a match.
      sandbox.stub(uut.WebhookModel, 'find').returns(['a'])
      // mock the trigger function.
      sandbox.stub(uut, 'triggerWebhook').resolves({})

      await uut.validationSucceededEventHandler(eventData)

      // Not throwing an error is a pass.
      // Looking at the code coverage report is how to check if this test case
      // is working properly.
      assert.equal(1, 1)
    })

    it('should report but not throw an error', async () => {
      await uut.validationSucceededEventHandler()

      // Not throwing an error is a pass.
      // Looking at the code coverage report is how to check if this test case
      // is working properly.
      assert.equal(1, 1)
    })
  })

  describe('#triggerWebhook', () => {
    it('should trigger a webhook given an array of matches', async () => {
      // Mock axios so it doesn't make any real network calls.
      sandbox.stub(uut.axios, 'post').resolves({})

      const matches = [{ url: 'http://test.com', appId: 'test' }]

      await uut.triggerWebhook(matches)
    })
  })

  describe('#addWebhook', async () => {
    it('should add new webhook model to the database', async () => {
      // Mock database dependencies.
      uut.WebhookModel = WebhookModelMock

      const data = {
        url: 'http://test.com',
        appId: 'test'
      }

      const result = await uut.addWebhook(data)
      // console.log(result)

      assert.equal(result, '123')
    })
  })

  describe('#deleteWebhook', () => {
    it('should delete the entry from the database, if it exists', async () => {
      // Mock database dependencies.
      uut.WebhookModel = WebhookModelMock

      const data = {
        url: 'http://test.com',
        appId: 'test'
      }

      const result = await uut.deleteWebhook(data)

      assert.equal(result, true)
    })

    it('should catch and throw an error', async () => {
      try {
        // Force an error
        uut.WebhookModel = WebhookModelMock
        sandbox.stub(uut.WebhookModel, 'find').rejects(new Error('test error'))

        const data = {
          url: 'http://test.com',
          appId: 'test'
        }

        await uut.deleteWebhook(data)

        assert.fail('Unexpected code path')
      } catch (err) {
        assert.include(err.message, 'test error')
      }
    })

    it('should exit quietly if there is no match', async () => {
      // Mock database dependencies.
      uut.WebhookModel = WebhookModelMock
      sandbox.stub(uut.WebhookModel, 'find').resolves([])

      const data = {
        url: 'http://test.com',
        appId: 'test'
      }

      const result = await uut.deleteWebhook(data)

      assert.equal(result, false)
    })
  })
})

// A simple mock of the Mongoose database model.
class WebhookModelMock {
  constructor (obj) {
    this._id = '123'

    this.remove = () => {}
  }

  static find () {
    const mock = new WebhookModelMock()
    return [mock]
  }

  save () {}
}
