import chai from 'chai'
import sinon from 'sinon'
import IPFSLib from '../../../src/adapters/ipfs/index.js'
import IPFSMock from '../mocks/ipfs-mock.js'
import IPFSCoordMock from '../mocks/ipfs-coord-mock.js'
/*
  Unit tests for the index.js file for the IPFS and ipfs-coord libraries.
*/
const assert = chai.assert
describe('#IPFS-adapter-index', () => {
  let uut
  let sandbox
  beforeEach(() => {
    uut = new IPFSLib()
    sandbox = sinon.createSandbox()
  })
  afterEach(() => sandbox.restore())
  describe('#start', () => {
    it('should throw error if bch-js is not passed', async () => {
      try {
        await uut.start()
        assert.fail('Unexpected code path.')
      } catch (err) {
        // console.log(err)
        assert.include(err.message, 'Instance of bch-js must be passed when instantiating IPFS adapter.')
      }
    })
    it('should return a promise that resolves into an instance of IPFS.', async () => {
      // Mock dependencies.
      uut.ipfsAdapter = new IPFSMock()
      uut.IpfsCoordAdapter = IPFSCoordMock
      const result = await uut.start({ bchjs: {} })
      assert.equal(result, true)
    })
    it('should catch and throw an error', async () => {
      try {
        // Force an error
        sandbox.stub(uut.ipfsAdapter, 'start').rejects(new Error('test error'))
        await uut.start({ bchjs: {} })
        assert.fail('Unexpected code path.')
      } catch (err) {
        // console.log(err)
        assert.include(err.message, 'test error')
      }
    })
    it('should handle lock-file errors', async () => {
      try {
        // Force an error
        sandbox
          .stub(uut.ipfsAdapter, 'start')
          .rejects(new Error('Lock already being held'))
        // Prevent process from exiting
        sandbox.stub(uut.process, 'exit').returns()
        await uut.start({ bchjs: {} })
        assert.fail('Unexpected code path.')
      } catch (err) {
        assert.include(err.message, 'Lock already being held')
      }
    })
  })
})
