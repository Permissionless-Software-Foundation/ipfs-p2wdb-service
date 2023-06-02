/*
  Unit tests for the REST API handler for the /entry endpoints.
*/

// Public npm libraries
import { assert } from 'chai'
import sinon from 'sinon'
import adapters from '../../../mocks/adapters/index.js'
import UseCasesMock from '../../../mocks/use-cases/index.js'
import EntryRouter from '../../../../../src/controllers/rest-api/entry/index.js'

let uut
let sandbox

describe('#Entry-REST-Router', () => {
  // const testUser = {}
  beforeEach(() => {
    const useCases = new UseCasesMock()
    uut = new EntryRouter({ adapters, useCases })
    sandbox = sinon.createSandbox()
    // Mock the context object.
    // ctx = mockContext()
  })

  afterEach(() => sandbox.restore())

  describe('#constructor', () => {
    it('should throw an error if adapters are not passed in', () => {
      try {
        uut = new EntryRouter()
        assert.fail('Unexpected code path')
      } catch (err) {
        assert.include(err.message, 'Instance of Adapters library required when instantiating Entry REST Controller.')
      }
    })

    it('should throw an error if useCases are not passed in', () => {
      try {
        uut = new EntryRouter({ adapters })
        assert.fail('Unexpected code path')
      } catch (err) {
        assert.include(err.message, 'Instance of Use Cases library required when instantiating Entry REST Controller.')
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

  describe('#postTicketEntry', () => {
    it('should route to the controller', async () => {
      // Mock dependencies and force desired code path.
      sandbox.stub(uut.entryRESTController, 'postTicketEntry').resolves()

      const result = await uut.postTicketEntry()

      assert.equal(result, true)
    })
  })
})
