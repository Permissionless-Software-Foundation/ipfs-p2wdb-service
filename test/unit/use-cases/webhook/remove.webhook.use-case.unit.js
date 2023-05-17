import chai from 'chai'
import sinon from 'sinon'
import RemoveWebhook from '../../../../src/use-cases/webhook/remove-webhook.js'
import adaptersMock from '../../mocks/adapters/index.js'
/*
  Unit tests for the add-webhook Use Case.
*/
const assert = chai.assert
describe('#RemoveWebhook', () => {
  let uut
  let sandbox
  beforeEach(() => {
    uut = new RemoveWebhook({
      webhookAdapter: adaptersMock.webhook
    })
    sandbox = sinon.createSandbox()
  })
  afterEach(() => sandbox.restore())
  describe('#constructor', () => {
    it('should throw an error if webhook adapter is not included', () => {
      try {
        uut = new RemoveWebhook()
        assert.fail('Unexpected code path')
      } catch (err) {
        assert.include(err.message, 'webhookAdapter instance must be included when instantiating RemoveWebhook')
      }
    })
  })
  describe('#remove', () => {
    it('should remove a webhook from the local database', async () => {
      // Mock dependencies
      sandbox.stub(uut.webhookAdapter, 'deleteWebhook').resolves(true)
      const rawData = {
        url: 'http://test.com',
        appId: 'test'
      }
      const result = await uut.remove(rawData)
      // console.log(id)
      assert.equal(result, true)
    })
    it('should catch and throw an error', async () => {
      try {
        await uut.remove()
        assert.fail('Unexpected code path')
      } catch (err) {
        assert.isOk(err)
      }
    })
  })
})
