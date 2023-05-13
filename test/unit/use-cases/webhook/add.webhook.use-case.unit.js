import chai from 'chai'
import sinon from 'sinon'
import AddWebhook from '../../../../src/use-cases/webhook/add-webhook.js'
import adaptersMock from '../../mocks/adapters/index.js'
/*
  Unit tests for the add-webhook Use Case.
*/
const assert = chai.assert
describe('#UseCase-AddWebhook', () => {
  let uut
  let sandbox
  beforeEach(() => {
    uut = new AddWebhook({
      webhookAdapter: adaptersMock.webhook
    })
    sandbox = sinon.createSandbox()
  })
  afterEach(() => sandbox.restore())
  describe('#constructor', () => {
    it('should throw an error if webhook adapter is not included', () => {
      try {
        uut = new AddWebhook()
        assert.fail('Unexpected code path')
      } catch (err) {
        assert.include(err.message, 'webhookAdapter instance must be included when instantiating AddWebhook')
      }
    })
  })
  describe('#addNewWebhook', () => {
    it('should add a new webhook to the local database', async () => {
      // Mock dependencies
      sandbox.stub(uut.webhookAdapter, 'addWebhook').resolves('123')
      const rawData = {
        url: 'http://test.com',
        appId: 'test'
      }
      const id = await uut.addNewWebhook(rawData)
      // console.log(id)
      assert.equal(id, '123')
    })
    it('should catch and throw an error', async () => {
      try {
        await uut.addNewWebhook()
        assert.fail('Unexpected code path')
      } catch (err) {
        assert.isOk(err)
      }
    })
  })
})
