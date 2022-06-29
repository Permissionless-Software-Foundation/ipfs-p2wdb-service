/*
  Unit tests for the p2wdb adapter library.
*/

// Global npm librares
const sinon = require('sinon')
const assert = require('chai').assert
const mongoose = require('mongoose')

// Local support libraries
const config = require('../../../config')
const P2WDB = require('../../../src/adapters/p2wdb')
const KeyValue = require('../../../src/adapters/localdb/models/key-value')
const OrbitDBAdapterMock = require('../mocks/orbitdb-mock').OrbitDBAdapterMock
const WritePrice = require('../../../src/adapters/write-price')

let uut
let sandbox

describe('#p2wdb', () => {
  before(async () => {
    // Connect to the Mongo Database.
    console.log(`Connecting to database: ${config.database}`)
    mongoose.Promise = global.Promise
    mongoose.set('useCreateIndex', true) // Stop deprecation warning.

    await mongoose.connect(config.database, {
      useUnifiedTopology: true,
      useNewUrlParser: true
    })

    // Entry for test
    const entry = new KeyValue({
      key: 'txid',
      hash: 'hash',
      appId: 'appid',
      value: { test: 'test' }
    })
    await entry.save()
  })

  beforeEach(() => {
    const writePrice = new WritePrice()

    uut = new P2WDB({ writePrice })
    uut.orbit = new OrbitDBAdapterMock()

    sandbox = sinon.createSandbox()
  })

  afterEach(() => sandbox.restore())

  after(() => {
    mongoose.connection.close()
  })

  describe('#constructor', () => {
    it('should throw an error if instance of WriteCost adapter is not provided', () => {
      try {
        uut = new P2WDB()
        console.log(uut)
        assert.fail('unexpected code path')
      } catch (err) {
        assert.include(err.message, 'Pass instance of writePrice when instantiating P2WDB adapter library.')
      }
    })
  })

  describe('#start', () => {
    it('should throw an error if IPFS instance is not passed.', async () => {
      try {
        await uut.start()
        assert.fail('unexpected code path')
      } catch (err) {
        assert.include(
          err.message,
          'Must past instance of IPFS when instantiating P2WDB adapter.'
        )
      }
    })

    it('should throw an error if bch-js instance is not passed.', async () => {
      try {
        await uut.start({ ipfs: {} })
        assert.fail('unexpected code path')
      } catch (err) {
        assert.include(
          err.message,
          'Must past instance of bchjs when instantiating P2WDB adapter.'
        )
      }
    })

    it('should return true after the database has started', async () => {
      // sandbox.stub(uut.ipfsAdapters, 'start').resolves(true)

      // mocking orbit db adapter
      uut.OribitAdapter = OrbitDBAdapterMock

      const result = await uut.start({ ipfs: {}, bchjs: {} })
      assert.isTrue(result)
      assert.isTrue(uut.isReady)
    })

    it('should catch and throw errors', async () => {
      try {
        // sandbox.stub(uut.ipfsAdapters, 'start').throws(new Error('test error'))
        uut.OribitAdapter = class OribitAdapter {
          constructor () {
            throw new Error('test error')
          }
        }

        await uut.start({ ipfs: {}, bchjs: {} })
        assert.fail('unexpected code path')
      } catch (err) {
        assert.include(err.message, 'test error')
      }
    })
  })

  describe('#insert', () => {
    it('should add a key-value to the orbit database and return a hash', async () => {
      const entry = { key: 'key', value: 'value' }
      const hash = await uut.insert(entry)
      assert.isString(hash)
    })

    it('should catch and throw an error', async () => {
      try {
        sandbox.stub(uut.orbit.db, 'put').throws(new Error('test error'))

        const entry = { key: 'key', value: 'value' }
        await uut.insert(entry)

        assert.fail('unexpected code path')
      } catch (err) {
        assert.include(err.message, 'test error')
      }
    })
  })

  describe('#readAll', () => {
    it('should get all entries in the P2WDB', async () => {
      const data = await uut.readAll()
      // console.log('data: ', data)

      assert.isArray(data)
    })

    it('should catch and throw an error', async () => {
      try {
        // sandbox.stub(uut.orbit, 'readAll').throws(new Error('test error'))

        // Force and error.
        sandbox.stub(uut.KeyValue, 'find').rejects(new Error('test error'))

        await uut.readAll()

        assert.fail('unexpected code path')
      } catch (err) {
        console.log(err)
        assert.include(err.message, 'is not a function')
      }
    })
  })

  describe('#readByHash', () => {
    it('should get entry by hash', async () => {
      const hash = 'hash'
      const result = await uut.readByHash(hash)
      assert.isObject(result)
    })

    it('should get null if hash not found', async () => {
      const hash = 'unknow hash'
      const result = await uut.readByHash(hash)
      assert.isNull(result)
    })

    it('should return null if input is not provided', async () => {
      const result = await uut.readByHash()
      assert.isNull(result)
    })

    it('should catch and throw an error', async () => {
      try {
        sandbox.stub(uut.KeyValue, 'findOne').throws(new Error('test error'))

        const hash = 'hash'
        await uut.readByHash(hash)

        assert.fail('unexpected code path')
      } catch (err) {
        assert.include(err.message, 'test error')
      }
    })
  })

  describe('#readByTxid', () => {
    it('should get entry by txid', async () => {
      const txid = 'txid'
      const result = await uut.readByTxid(txid)
      assert.isObject(result)
    })

    it('should get null if txid not found', async () => {
      const txid = 'unknow txid'
      const result = await uut.readByTxid(txid)
      assert.isNull(result)
    })

    it('should return null if input is not provided', async () => {
      const result = await uut.readByTxid()
      assert.isNull(result)
    })

    it('should catch and throw an error', async () => {
      try {
        sandbox.stub(uut.KeyValue, 'findOne').throws(new Error('test error'))

        const hash = 'hash'
        await uut.readByTxid(hash)

        assert.fail('unexpected code path')
      } catch (err) {
        assert.include(err.message, 'test error')
      }
    })
  })

  describe('#readByAppId', () => {
    it('should get entries by appId', async () => {
      const appId = 'appid'
      const result = await uut.readByAppId(appId)
      assert.isArray(result)
      assert(result.length > 0)
    })

    it('should get empty array if appId not found', async () => {
      const randNum = Math.floor(Math.random() * 1000)
      const appId = `unknow${randNum}`

      const result = await uut.readByAppId(appId)
      console.log('result: ', result)

      assert.isArray(result)
      assert.isEmpty(result)
    })

    it('should return empty array if input is not provided', async () => {
      const result = await uut.readByAppId()

      assert.isArray(result)
      assert.isEmpty(result)
    })

    it('should catch and throw an error', async () => {
      try {
        sandbox.stub(uut.KeyValue, 'find').throws(new Error('test error'))

        const hash = 'hash'
        await uut.readByAppId(hash)

        assert.fail('unexpected code path')
      } catch (err) {
        assert.include(err.message, 'test error')
      }
    })
  })
})
