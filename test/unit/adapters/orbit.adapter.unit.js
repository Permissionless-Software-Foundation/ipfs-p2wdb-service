/*
  Unit tests for the pay-to-write.js library.
*/

const sinon = require('sinon')
const assert = require('chai').assert

const OrbitDBAdapter = require('../../../src/adapters/orbit')
const KeyValueMock = require('../mocks/model-mock.js')
const OrbitDBMock = require('../mocks/orbitdb-mock').OrbitDBMock
const config = require('../../../config')
let uut
let sandbox

describe('#OrbitDBAdapter', () => {
  beforeEach(() => {
    uut = new OrbitDBAdapter({ ipfs: { id: () => { return 'ipfs id' } } })

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
        assert.include(err.message, 'Must pass an instance of ipfs')
      }
    })
  })
  describe('#start', () => {
    it('should start', async () => {
      // mock function for keyvalue instance in orbitdb
      const keyValueKakeFn = () => {
        return new OrbitDBMock()
      }

      // mock for orbitdb instance
      sandbox
        .stub(uut.OrbitDB, 'createInstance')
        .resolves({ keyvalue: keyValueKakeFn })

      await uut.start()
      assert.isTrue(uut.isReady)
    })

    // TODO
    it('should catch and throw errors', async () => {
      try {
        // Force Error
        sandbox
          .stub(uut, 'createDb')
          .throws(new Error('test error'))

        await uut.start()

        assert.fail('unexpected code path')
      } catch (err) {
        assert.include(err.message, 'test error')
      }
    })
  })
  describe('#createDb', () => {
    it('should use default db name in config file if name is not provided', async () => {
      // mock function for keyvalue instance in orbitdb
      const keyValueKakeFn = (dbName) => {
        assert.equal(dbName, config.orbitDbName, 'expected to use default db name')
        return new OrbitDBMock()
      }

      // mock for orbitdb instance
      sandbox
        .stub(uut.OrbitDB, 'createInstance')
        .resolves({ keyvalue: keyValueKakeFn })

      await uut.createDb()
      assert.isTrue(uut.isReady)
    })

    it('should use db name provided', async () => {
      const myDbName = 'myDbName'

      // mock function for keyvalue instance in orbitdb
      const keyValueFakeFn = (dbName) => {
        assert.equal(dbName, myDbName, 'expected to use db name provided')
        return new OrbitDBMock()
      }

      // mock for orbitdb instance
      sandbox
        .stub(uut.OrbitDB, 'createInstance')
        .resolves({ keyvalue: keyValueFakeFn })

      await uut.createDb(myDbName)
      assert.isTrue(uut.isReady)
    })
    it('should catch and throw errors', async () => {
      try {
        // Force Error
        sandbox
          .stub(uut.OrbitDB, 'createInstance')
          .throws(new Error('test error'))

        await uut.createDb()
        assert.fail('unexpected code path')
      } catch (err) {
        assert.include(err.message, 'test error')
      }
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
        assert.include(err.message, 'Cannot read property')
      }
    })
  })
})
