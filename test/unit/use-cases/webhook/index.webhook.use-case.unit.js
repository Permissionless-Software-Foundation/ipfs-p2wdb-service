import chai from 'chai'
import sinon from 'sinon'
import EntryUseCases from '../../../../src/use-cases/entry/index.js'
import adaptersMock from '../../mocks/adapters/index.js'
/*
  Unit tests for the Entry Use Case index.js library.
*/
const assert = chai.assert
describe('#EntryUseCases', () => {
  let uut
  let sandbox
  beforeEach(() => {
    uut = new EntryUseCases({
      adapters: adaptersMock
    })
    sandbox = sinon.createSandbox()
  })
  afterEach(() => sandbox.restore())
  describe('#constructor', () => {
    it('should throw an error if adapters are not included', () => {
      try {
        uut = new EntryUseCases()
        assert.fail('Unexpected code path')
        console.log(uut)
      } catch (err) {
        assert.include(err.message, 'Instance of adapters must be passed in when instantiating Entry Use Cases library.')
      }
    })
  })
})
