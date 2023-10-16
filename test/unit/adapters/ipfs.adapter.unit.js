/*
  Unit test for the adapters/ipfs.js library.
*/

// Global npm libraries
import { assert } from 'chai'
import sinon from 'sinon'
import cloneDeep from 'lodash.clonedeep'

// Import local libraries
import config from '../../../config/index.js'
import IPFSLib from '../../../src/adapters/ipfs/ipfs.js'
// import IPFSMock from '../mocks/ipfs-mock.js'
import createHeliaLib from '../mocks/helia-mock.js'

describe('#IPFS-adapter', () => {
  let uut
  let sandbox
  let ipfs

  beforeEach(() => {
    uut = new IPFSLib()
    sandbox = sinon.createSandbox()
    ipfs = cloneDeep(createHeliaLib)
  })

  afterEach(() => {
    sandbox.restore()
  })

  describe('#constructor', () => {
    it('should instantiate IPFS Lib in dev mode.', async () => {
      const _uut = new IPFSLib()

      assert.exists(_uut)
      assert.isFunction(_uut.start)
      assert.isFunction(_uut.stop)
    })

    it('should instantiate dev IPFS Lib in production mode.', async () => {
      config.isProduction = true
      const _uut = new IPFSLib()

      assert.exists(_uut)
      assert.isFunction(_uut.start)
      assert.isFunction(_uut.stop)
      config.isProduction = false
    })
  })

  describe('#start', () => {
    it('should return a promise that resolves into an instance of IPFS.', async () => {
      // Mock dependencies.
      sandbox.stub(uut, 'createNode').resolves(ipfs)

      const result = await uut.start()
      // console.log('result: ', result)

      // Assert properties of the instance are set.
      assert.equal(uut.isReady, true)
      assert.property(uut, 'multiaddrs')
      assert.property(uut, 'id')

      // Output should be an instance of IPFS
      assert.property(result, 'libp2p')
    })

    it('should catch and throw an error', async () => {
      try {
        // Force an error
        sandbox.stub(uut, 'createNode').rejects(new Error('test error'))

        await uut.start()
        assert.fail('Unexpected code path.')
      } catch (err) {
        // console.log(err)
        assert.include(err.message, 'test error')
      }
    })
  })

  describe('#stop', () => {
    it('should stop the IPFS node', async () => {
      // Mock dependencies
      uut.ipfs = {
        stop: () => {
        }
      }
      const result = await uut.stop()
      assert.equal(result, true)
    })
  })
  // describe('#rmBlocksDir', () => {
  //   it('should delete the /blocks directory', () => {
  //     const result = uut.rmBlocksDir()
  //
  //     assert.equal(result, true)
  //   })
  //
  //   it('should catch and throw an error', () => {
  //     try {
  //       // Force an error
  //       sandbox.stub(uut.fs, 'rmdirSync').throws(new Error('test error'))
  //
  //       uut.rmBlocksDir()
  //
  //       assert.fail('Unexpected code path')
  //     } catch (err) {
  //       assert.equal(err.message, 'test error')
  //     }
  //   })
  // })
})
