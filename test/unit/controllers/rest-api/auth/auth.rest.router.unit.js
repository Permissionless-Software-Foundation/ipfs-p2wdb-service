import chai from 'chai'
import sinon from 'sinon'
import adapters from '../../../mocks/adapters/index.js'
import UseCasesMock from '../../../mocks/use-cases/index.js'
import AuthRouter from '../../../../../src/controllers/rest-api/auth/index.js'
/*
  Unit tests for the REST API handler for the /users endpoints.
*/
// Public npm libraries
const assert = chai.assert
let uut
let sandbox
// let ctx
// const mockContext = require('../../../../unit/mocks/ctx-mock').context
describe('#Auth-REST-Router', () => {
  // const testUser = {}
  beforeEach(() => {
    const useCases = new UseCasesMock()
    uut = new AuthRouter({ adapters, useCases })
    sandbox = sinon.createSandbox()
    // Mock the context object.
    // ctx = mockContext()
  })
  afterEach(() => sandbox.restore())
  describe('#constructor', () => {
    it('should throw an error if adapters are not passed in', () => {
      try {
        uut = new AuthRouter()
        assert.fail('Unexpected code path')
      } catch (err) {
        assert.include(err.message, 'Instance of Adapters library required when instantiating PostEntry REST Controller.')
      }
    })
    it('should throw an error if useCases are not passed in', () => {
      try {
        uut = new AuthRouter({ adapters })
        assert.fail('Unexpected code path')
      } catch (err) {
        assert.include(err.message, 'Instance of Use Cases library required when instantiating PostEntry REST Controller.')
      }
    })
  })
  describe('#attach', () => {
    it('should throw an error if app is not passed in.', () => {
      try {
        uut.attach()
        assert.fail('Unexpected code path')
      } catch (err) {
        assert.include(err.message, 'Must pass app object when attached REST API controllers.')
      }
    })
  })
})
