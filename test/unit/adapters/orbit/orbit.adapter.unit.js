/*
  Unit test library for adapters/orbit/index.js library.
*/

// Global npm libraries
import sinon from 'sinon'
import { assert } from 'chai'
// import cloneDeep from 'lodash.clonedeep'

// Local libraries
import OrbitDBAdapter from '../../../../src/adapters/orbit/index.js'
import KeyValueMock from '../../mocks/model-mock.js'
import { OrbitDBMock } from '../../mocks/orbitdb-mock.js'
// import config from '../../../../config/index.js'
import WritePrice from '../../../../src/adapters/write-price.js'
import { MockBchWallet } from '../../mocks/adapters/wallet.js'
import ipfs from '../../mocks/helia-mock.js'

describe('#OrbitDBAdapter', () => {
  let uut
  let sandbox
  let mockWallet

  beforeEach(() => {
    mockWallet = new MockBchWallet()
    const writePrice = new WritePrice()

    uut = new OrbitDBAdapter({
      ipfs,
      writePrice,
      wallet: mockWallet
    })
    // Mock database dependencies.
    uut.db = new OrbitDBMock()
    uut.KeyValue = KeyValueMock
    sandbox = sinon.createSandbox()
  })

  afterEach(() => sandbox.restore())

  describe('#constructor', () => {
    it('should throw an error if instance of IPFS is not provided', () => {
      try {
        const _uut = new OrbitDBAdapter()
        console.log(_uut)

        assert.fail('unexpected code path')
      } catch (err) {
        assert.include(err.message, 'Must pass an instance of ipfs when instancing the OrbitDBAdapter class.')
      }
    })

    it('should throw an error if instance of WriteCost adapter is not provided', () => {
      try {
        const _uut = new OrbitDBAdapter()
        console.log(_uut)
        assert.fail('unexpected code path')
      } catch (err) {
        assert.include(err.message, 'Must pass an instance of ipfs')
      }
    })
  })

  describe('#start', () => {
    it('should start', async () => {
      // mock dependencies
      sandbox.stub(uut, 'createDb').resolves({})
      const result = await uut.start({ bchjs: {} })
      assert.isTrue(result)
    })

    it('should catch and throw errors', async () => {
      try {
        // Force Error
        sandbox.stub(uut, 'createDb').throws(new Error('test error'))
        await uut.start()
        assert.fail('unexpected code path')
      } catch (err) {
        assert.include(err.message, 'test error')
      }
    })
  })

  describe('#createDb', () => {
    it('should use default db name in config file if name is not provided', async () => {
      // Mock dependencies
      uut.P2WCanAppend = class P2WCanAppend {
        injectDeps () {}
      }
      sandbox.stub(uut, 'createOrbitDB').resolves({
        open: async () => {
          return {
            address: 'fake-address',
            events: {
              on: () => {}
            },
            all: async () => [1]
          }
        }
      })

      const result = await uut.createDb({ wallet: mockWallet })
      // console.log('result: ', result)

      assert.isTrue(uut.isReady)
      assert.equal(result.address, 'fake-address')
    })

    it('should use db name provided', async () => {
      // Mock dependencies
      uut.P2WCanAppend = class P2WCanAppend {
        injectDeps () {}
      }
      sandbox.stub(uut, 'createOrbitDB').resolves({
        open: async () => {
          return {
            address: 'fake-address',
            events: {
              on: () => {}
            },
            all: async () => [1]
          }
        }
      })

      const result = await uut.createDb({
        wallet: mockWallet,
        dbName: 'test-db'
      })
      // console.log('result: ', result)

      assert.isTrue(uut.isReady)
      assert.equal(result.address, 'fake-address')
    })

    it('should catch and throw errors', async () => {
      try {
        // Mock dependencies
        uut.P2WCanAppend = class P2WCanAppend {
          injectDeps () {}
        }
        sandbox.stub(uut, 'createOrbitDB').resolves({
          open: async () => {
            return {
              address: 'fake-address',
              events: {
                on: () => {}
              },
              all: async () => [1]
            }
          }
        })

        // Force error
        sandbox.stub(uut, 'useAccessController').throws(new Error('test error'))

        await uut.createDb({
          wallet: mockWallet,
          dbName: 'test-db'
        })

        assert.fail('unexpected code path')
      } catch (err) {
        assert.include(err.message, 'test error')
      }
    })

    it('should exit if manifest can not be retrieved', async () => {
      // Mock dependencies
      uut.P2WCanAppend = class P2WCanAppend {
        injectDeps () {}
      }
      sandbox.stub(uut, 'createOrbitDB').resolves({
        open: async () => {
          throw new Error('test error')
        }
      })
      sandbox.stub(uut, 'exitProgram').returns()

      const result = await uut.createDb({ wallet: mockWallet })

      assert.equal(result, false)
    })
  })

  describe('#readAll', () => {
    it('should read all data from the database', () => {
      const result = uut.readAll()
      assert.isObject(result)
    })
    it('should catch and throw errors', () => {
      try {
        uut.db = undefined
        uut.readAll()
        assert.fail('unexpected code path')
      } catch (err) {
        assert.include(err.message, 'Cannot read')
      }
    })
  })
})
