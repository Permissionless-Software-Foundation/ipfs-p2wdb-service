/*
  Unit tests for the localdb adapter library.
*/

const sinon = require('sinon')
const assert = require('chai').assert
const mongoose = require('mongoose')

const config = require('../../../config')
const Entry = require('../../../src/adapters/entry')

let uut
let sandbox

describe('#entry', () => {
  before(async () => {
    // Connect to the Mongo Database.
    console.log(`Connecting to database: ${config.database}`)
    mongoose.Promise = global.Promise
    mongoose.set('useCreateIndex', true) // Stop deprecation warning.

    await mongoose.connect(
      config.database,
      {
        useUnifiedTopology: true,
        useNewUrlParser: true
      }
    )
  })
  beforeEach(() => {
    uut = new Entry()

    sandbox = sinon.createSandbox()
  })

  afterEach(() => sandbox.restore())
  after(() => {
    mongoose.connection.close()
  })
  describe('#insert', () => {
    it('should add an entry to the database and return the _id value', async () => {
      const entry = {
        key: 'txid',
        hash: 'hash',
        appId: 'appid',
        value: { test: 'test' }
      }
      const result = await uut.insert(entry)
      assert.isString(result)
    })

    it('should throw error if entry is not provided', async () => {
      try {
        await uut.insert()
        assert.fail('unexpected code path')
      } catch (err) {
        assert.include(err.message, 'entry object is required')
      }
    })
    it('should throw error if entry does not has the key property', async () => {
      try {
        const entry = { }
        await uut.insert(entry)
        assert.fail('unexpected code path')
      } catch (err) {
        assert.include(err.message, 'property "key" must be a string')
      }
    })
  })
  describe('#doesEntryExist', () => {
    it('should return false if entry is not in the database.', async () => {
      const entry = { key: 'unknowEntry' }
      const result = await uut.doesEntryExist(entry)
      assert.isFalse(result)
    })

    it('should return true if entry is already in the database.', async () => {
      const entry = { key: 'txid' }
      const result = await uut.doesEntryExist(entry)
      assert.isTrue(result)
    })

    it('should throw error if entry is not provided', async () => {
      try {
        await uut.doesEntryExist()
        assert.fail('unexpected code path')
      } catch (err) {
        assert.include(err.message, 'entry object is required')
      }
    })

    it('should throw error if entry does not has the key property', async () => {
      try {
        const entry = { }
        await uut.doesEntryExist(entry)
        assert.fail('unexpected code path')
      } catch (err) {
        assert.include(err.message, 'property "key" must be a string')
      }
    })
  })
})
