/*
  Unit tests for the IPFS Adapter.
*/

// Global npm libraries
import { assert } from 'chai'
import sinon from 'sinon'

// Local libraries
import IPFSCoordAdapter from '../../../src/adapters/ipfs/ipfs-coord.js'
// import create from '../mocks/ipfs-mock.js'
import ipfs from '../mocks/helia-mock.js'
import { MockBchWallet } from '../mocks/adapters/wallet.js'
import IPFSCoordMock from '../mocks/ipfs-coord-mock.js'
import config from '../../../config/index.js'

describe('#ipfs-coord', () => {
  let uut
  let sandbox
  const wallet = new MockBchWallet()
  const bchjs = wallet.bchjs

  beforeEach(() => {
    // const ipfs = create()
    uut = new IPFSCoordAdapter({ ipfs, bchjs })

    sandbox = sinon.createSandbox()
  })

  afterEach(() => sandbox.restore())

  describe('#constructor', () => {
    it('should throw an error if ipfs instance is not included', () => {
      try {
        uut = new IPFSCoordAdapter()
        assert.fail('Unexpected code path')
      } catch (err) {
        assert.include(err.message, 'Instance of IPFS must be passed when instantiating ipfs-coord.')
      }
    })

    it('should throw an error if bchjs instance is not included', () => {
      try {
        // const ipfs = create()
        uut = new IPFSCoordAdapter({ ipfs })
        assert.fail('Unexpected code path')
      } catch (err) {
        assert.include(err.message, 'Instance of bch-js must be passed when instantiating ipfs-coord.')
      }
    })

    it('should get the public IP address if this node is a Circuit Relay', async () => {
      // Mock dependencies.
      uut.IpfsCoord = IPFSCoordMock
      sandbox.stub(uut.publicIp, 'v4').resolves('123')

      // Force Circuit Relay
      uut.config.isCircuitRelay = true
      const result = await uut.start()
      // console.log('result: ', result)
      assert.equal(result, true)
    })

    it('should exit quietly if this node is a Circuit Relay and there is an issue getting the IP address', async () => {
      // Mock dependencies.
      uut.IpfsCoord = IPFSCoordMock
      sandbox.stub(uut.publicIp, 'v4').rejects(new Error('test error'))

      // Force Circuit Relay
      uut.config.isCircuitRelay = true

      const result = await uut.start()
      // console.log('result: ', result)

      assert.equal(result, true)
    })

    it('should return a promise that resolves into an instance of IPFS in production mode', async () => {
      uut.config.isProduction = true
      uut.config.isCircuitRelay = false
      // Mock dependencies.
      uut.IpfsCoord = IPFSCoordMock
      const result = await uut.start()
      // console.log('result: ', result)
      assert.equal(result, true)
      config.isProduction = false
    })
  })

  // TODO:
  // This test stopped passing after the jwt-bch-lib was introduced. It needs
  // to be debugged and reinstated.
  //
  // describe('#start', () => {
  // it('should return a promise that resolves into an instance of IPFS.', async () => {
  //   // Mock dependencies.
  //   uut.IpfsCoord = IPFSCoordMock

  //   console.log('uut: ', uut)
  //   const result = await uut.start()
  //   // console.log('result: ', result)

  //   assert.equal(result, true)
  // })

  //   it('should catch errors and exit quietly', async () => {
  //     const oldConfig = uut.config.isCircuitRelay
  //     uut.config.isCircuitRelay = true

  //     // Force an error
  //     sandbox.stub(uut.publicIp,'v4').rejects(new Error('test error'))

  //     try {
  //       await uut.start()
  //     } catch(err) {
  //       assert.include(err.message, 'test error')
  //     }

  //     uut.config.isCircuitRelay = oldConfig
  //   })
  // })

  describe('#attachRPCRouter', () => {
    it('should attached a router output', async () => {
      // Mock dependencies
      uut.ipfsCoord = {
        privateLog: {},
        ipfs: {
          orbitdb: {
            privateLog: {}
          }
        },
        adapters: {
          pubsub: {
            privateLog: () => {
            }
          }
        }
      }
      const router = console.log
      uut.attachRPCRouter(router)
    })

    it('should catch and throw an error', () => {
      try {
        // Force an error
        delete uut.ipfsCoord.adapters
        const router = console.log
        uut.attachRPCRouter(router)
        assert.fail('Unexpected code path')
      } catch (err) {
        assert.include(err.message, 'Cannot read')
      }
    })
  })

  describe('#subscribeToChat', () => {
    it('should subscribe to the chat channel', async () => {
      // Mock dependencies
      uut.ipfsCoord = {
        adapters: {
          pubsub: {
            subscribeToPubsubChannel: async () => {
            }
          }
        }
      }
      await uut.subscribeToChat()
    })
  })
})
