import sinon from 'sinon'
import chai from 'chai'
import WebhookRESTController from '../../../../../src/controllers/rest-api/webhook/index.js'
import adaptersMock from '../../../mocks/adapters/index.js'
import UseCasesMock from '../../../mocks/use-cases/index.js'
const assert = chai.assert
describe('#WebhookRESTController', () => {
  let uut
  let useCasesMock
  let sandbox
  beforeEach(() => {
    useCasesMock = new UseCasesMock()
    uut = new WebhookRESTController({
      adapters: adaptersMock,
      useCases: useCasesMock
    })
    sandbox = sinon.createSandbox()
  })
  afterEach(() => sandbox.restore())
  describe('#constructor', () => {
    it('should throw an error if adapters are not included.', () => {
      try {
        uut = new WebhookRESTController()
        assert.fail('Unexpected code path')
      } catch (err) {
        assert.include(err.message, 'Instance of Adapters library required when instantiating Webhook REST Controller.')
      }
    })
    it('should throw an error if use-cases instance are not included.', () => {
      try {
        uut = new WebhookRESTController({ adapters: adaptersMock })
        assert.fail('Unexpected code path')
      } catch (err) {
        assert.include(err.message, 'Instance of Use Cases library required when instantiating Webhook REST Controller.')
      }
    })
  })
  describe('#attac', () => {
    it('should throw an error if app object is not passed as input', () => {
      try {
        uut.attach()
        assert.fail('Unexpected code path')
      } catch (err) {
        assert.include(err.message, 'Must pass app object when attached REST API controllers.')
      }
    })
    it('should attach the routes to the app', () => {
      // Mock the Koa app.
      const app = {
        use: () => { }
      }
      uut.attach(app)
    })
  })
})
