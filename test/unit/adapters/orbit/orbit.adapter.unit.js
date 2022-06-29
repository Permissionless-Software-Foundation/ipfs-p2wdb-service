/*
  Unit tests for the pay-to-write.js library.
*/

// Global npm libraries
const sinon = require('sinon')
const assert = require('chai').assert

// local libraries
const OrbitDBAdapter = require('../../../../src/adapters/orbit')
const KeyValueMock = require('../../mocks/model-mock.js')
const OrbitDBMock = require('../../mocks/orbitdb-mock').OrbitDBMock
const config = require('../../../../config')
const WritePrice = require('../../../../src/adapters/write-price')

describe('#OrbitDBAdapter', () => {
  let uut
  let sandbox

  beforeEach(() => {
    const writePrice = new WritePrice()

    uut = new OrbitDBAdapter({
      ipfs: {
        id: () => {
          return 'ipfs id'
        }
      },
      writePrice
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
        const ipfs = { a: 'b' }

        const _uut = new OrbitDBAdapter({ ipfs })

        console.log(_uut)
        assert.fail('unexpected code path')
      } catch (err) {
        assert.include(err.message, 'Pass instance of writePrice when instantiating OrbitDBAdapter adapter library.')
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
      // mock function for keyvalue instance in orbitdb
      const keyValueKakeFn = (dbName) => {
        assert.equal(
          dbName,
          config.orbitDbName,
          'expected to use default db name'
        )
        return new OrbitDBMock()
      }

      // mock for orbitdb instance
      sandbox
        .stub(uut.OrbitDB, 'createInstance')
        .resolves({ keyvalue: keyValueKakeFn })

      await uut.createDb({ bchjs: {} })
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

      await uut.createDb({ dbName: myDbName, bchjs: {} })
      assert.isTrue(uut.isReady)
    })

    it('should catch and throw errors', async () => {
      try {
        // Force Error
        sandbox
          .stub(uut.OrbitDB, 'createInstance')
          .throws(new Error('test error'))

        await uut.createDb({ bchjs: {} })
        assert.fail('unexpected code path')
      } catch (err) {
        assert.include(err.message, 'test error')
      }
    })

    it('should throw error if bch-js is not passed', async () => {
      try {
        const myDbName = 'myDbName'

        await uut.createDb({ dbName: myDbName })

        assert.fail('unexpected code path')
      } catch (err) {
        assert.include(err.message, 'Instance of bchjs required when called createDb()')
      }
    })

    it('should exit if manifest can not be retrieved', async () => {
      const myDbName = 'myDbName'

      // mock function for keyvalue instance in orbitdb
      const keyValueFakeFn = (dbName) => {
        // assert.equal(dbName, myDbName, 'expected to use db name provided')
        // return new OrbitDBMock()
        throw new Error('test error')
      }

      // mock for orbitdb instance
      sandbox
        .stub(uut.OrbitDB, 'createInstance')
        .resolves({ keyvalue: keyValueFakeFn })
      sandbox.stub(uut, 'exitProgram').returns()

      await uut.createDb({ dbName: myDbName, bchjs: {} })
      assert.isTrue(uut.isReady)
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
