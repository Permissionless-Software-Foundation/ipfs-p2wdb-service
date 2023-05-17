import chai from 'chai'
import sinon from 'sinon'
import WebhookUseCases from '../../../../src/use-cases/webhook/index.js'
import adaptersMock from '../../mocks/adapters/index.js'
/*
  Unit tests for the Webhook Use Case index.js library.
*/
const assert = chai.assert
describe('#WebhookUseCases', () => {
  let uut
  let sandbox
  beforeEach(() => {
    uut = new WebhookUseCases({
      adapters: adaptersMock
    })
    sandbox = sinon.createSandbox()
  })
  afterEach(() => sandbox.restore())
  describe('#constructor', () => {
    it('should throw an error if webhook adapter is not included', () => {
      try {
        uut = new WebhookUseCases()
        assert.fail('Unexpected code path')
        console.log(uut)
      } catch (err) {
        assert.include(err.message, 'Instance of adapters must be passed in when instantiating Webhook Use Cases library.')
      }
    })
  })
})
