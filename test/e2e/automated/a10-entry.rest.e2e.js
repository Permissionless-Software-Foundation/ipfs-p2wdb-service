// e2e test for entry endpoint
const assert = require('chai').assert
const config = require('../../../config')
const axios = require('axios').default
const sinon = require('sinon')

const util = require('util')
util.inspect.defaultOptions = { depth: 1 }

const LOCALHOST = `http://localhost:${config.port}`

const EntryController = require('../../../src/controllers/rest-api/entry/controller')
const Adapters = require('../../../src/adapters')
const adapters = new Adapters()
const UseCases = require('../../../src/use-cases/')

let uut
let sandbox
const context = {
  hash: 'myEntryHash',
  txid: 'myTxId',
  appId: 'myAppId'
}

describe('Entry', () => {
  beforeEach(() => {
    const useCases = new UseCases({ adapters })
    uut = new EntryController({ adapters, useCases })

    sandbox = sinon.createSandbox()
  })

  afterEach(() => sandbox.restore())

  after(async () => {
    // Remove the added entry from db
    const result = await adapters.entry.KeyValue.findOne({ key: context.txid })
    await result.remove()
  })

  describe('POST /entry/write - Create Entry', () => {
    it('should reject when data is incomplete', async () => {
      try {
        const options = {
          method: 'POST',
          url: `${LOCALHOST}/entry/write`,
          data: {}
        }

        await axios(options)

        assert(false, 'Unexpected result')
      } catch (err) {
        // console.log(err)
        assert(err.response.status === 422, 'Error code 422 expected.')
      }
    })

    it('should reject if no txid property is provided', async () => {
      try {
        const options = {
          method: 'POST',
          url: `${LOCALHOST}/entry/write`,
          data: {}
        }
        await axios(options)

        assert(false, 'Unexpected result')
      } catch (err) {
        // console.log('err', err)
        assert.equal(err.response.status, 422)
        assert.include(
          err.response.data,
          'TXID must be a string containing a transaction ID of proof-of-burn.'
        )
      }
    })

    it('should reject if no data property is provided', async () => {
      try {
        const options = {
          method: 'POST',
          url: `${LOCALHOST}/entry/write`,
          data: {
            txid: 'txid'
          }
        }
        await axios(options)

        assert(false, 'Unexpected result')
      } catch (err) {
        // console.log('err', err)
        assert.equal(err.response.status, 422)
        assert.include(err.response.data, 'Entry requires an data property.')
      }
    })

    it('should create entry', async () => {
      try {
        // Mock to ignore orbit db
        // add this entry directly to the mongodb

        const fkFn = async (entryObj) => {
          const entry = new adapters.entry.KeyValue(entryObj)
          entry.hash = context.hash
          await entry.save()
          return entry.hash
        }

        sandbox
          .stub(uut.useCases.entry.addEntry.p2wdbAdapter, 'insert')
          .callsFake(fkFn)

        const options = {
          method: 'post',
          url: `${LOCALHOST}/entry/write`,
          data: {
            txid: context.txid,
            signature: 'signature',
            message: 'message',
            data: 'data',
            appId: context.appId
          }
        }
        const result = await axios(options)

        assert(result.status === 200, 'Status Code 200 expected.')
        assert.isTrue(result.data.success)
        assert.isString(result.data.hash)
      } catch (err) {
        console.log(err)
        assert.fail('unexpected code path')
      }
    })
  })

  describe('GET /entry/all', () => {
    it('should fetch all', async () => {
      const options = {
        method: 'GET',
        url: `${LOCALHOST}/entry/all/0`
      }
      const result = await axios(options)
      // console.log('result.data: ', result.data)

      assert.property(result.data, 'success')
      assert.equal(result.data.success, true)

      assert.isArray(result.data.data)
    })

    // it('should return a 422 http status if biz-logic throws an error', async () => {
    //   try {
    //     // Force an error
    //     // sandbox
    //     //   .stub(uut.useCases.entry.readEntry, 'readAllEntries')
    //     //   .rejects(new Error('test error'))
    //     // sandbox
    //     //   .stub(useCases.entry.readEntry, 'readAllEntries')
    //     //   .rejects(new Error('test error'))
    //
    //     const options = {
    //       method: 'GET',
    //       url: `${LOCALHOST}/entry/all/0`
    //     }
    //     const result = await axios(options)
    //     console.log('result.data: ', result.data)
    //
    //     assert.fail('Unexpected code path!')
    //   } catch (err) {
    //     console.log('err: ', err)
    //     assert.equal(err.response.status, 422)
    //     assert.equal(err.response.data, 'test error')
    //   }
    // })

    it('should return a 404 if page is not specified', async () => {
      try {
        const options = {
          method: 'GET',
          url: `${LOCALHOST}/entry/all`
        }
        await axios(options)

        assert.fail('Unexpected code path!')
      } catch (err) {
        assert.equal(err.response.status, 404)
      }
    })
  })

  describe('GET /entry/hash/:hash', () => {
    it("should throw 404 if hash doesn't exist", async () => {
      try {
        const options = {
          method: 'GET',
          url: `${LOCALHOST}/entry/hash/5fa4bd7ee1828f5f4d8ed004`
        }
        await axios(options)

        assert.equal(true, false, 'Unexpected behavior')
      } catch (err) {
        assert.equal(err.response.status, 404)
      }
    })

    it('should fetch by hash', async () => {
      const options = {
        method: 'GET',
        url: `${LOCALHOST}/entry/hash/${context.hash}`
      }
      const result = await axios(options)
      const entry = result.data

      assert.isObject(entry)
      assert.isTrue(entry.success)
      assert.property(entry.data, 'isValid')
      assert.property(entry.data, 'appId')
      assert.property(entry.data, '_id')
      assert.property(entry.data, 'hash')
      assert.property(entry.data, 'key')
      assert.property(entry.data, 'value')
    })
  })
  describe('GET /entry/txid/:txid', () => {
    it("should throw 404 if txid doesn't exist", async () => {
      try {
        const options = {
          method: 'GET',
          url: `${LOCALHOST}/entry/txid/5fa4bd7ee1828f5f4d8ed004`
        }
        await axios(options)

        assert.equal(true, false, 'Unexpected behavior')
      } catch (err) {
        assert.equal(err.response.status, 404)
      }
    })

    it('should fetch by txid', async () => {
      const options = {
        method: 'GET',
        url: `${LOCALHOST}/entry/txid/${context.txid}`
      }
      const result = await axios(options)
      const entry = result.data

      assert.isObject(entry)
      assert.isTrue(entry.success)
      assert.property(entry.data, 'isValid')
      assert.property(entry.data, 'appId')
      assert.property(entry.data, '_id')
      assert.property(entry.data, 'hash')
      assert.property(entry.data, 'key')
      assert.property(entry.data, 'value')
    })
  })

  describe('GET /entry/appid/:appid', () => {
    it("should return empty array if appId doesn't exist", async () => {
      const options = {
        method: 'GET',
        url: `${LOCALHOST}/entry/appid/id`
      }
      const result = await axios(options)
      const entries = result.data.data
      assert.isTrue(result.data.success)
      assert.isArray(entries)
      assert.equal(entries.length, 0)
    })

    it('should fetch by appId', async () => {
      const options = {
        method: 'GET',
        url: `${LOCALHOST}/entry/appid/${context.appId}`
      }
      const result = await axios(options)
      const entries = result.data.data
      const entry = entries[0]

      assert.isTrue(result.data.success)
      assert.isArray(entries)

      assert.isObject(entry)
      assert.property(entry, 'isValid')
      assert.property(entry, 'appId')
      assert.property(entry, '_id')
      assert.property(entry, 'hash')
      assert.property(entry, 'key')
      assert.property(entry, 'value')
    })
  })

  describe('GET /entry/cost/psf', () => {
    it('should return the current PSF cost for a write', async () => {
      const options = {
        method: 'GET',
        url: `${LOCALHOST}/entry/cost/psf`
      }
      const result = await axios(options)
      // console.log('result.data: ', result.data)

      assert.property(result.data, 'success')
      assert.property(result.data, 'psfCost')

      assert.equal(result.data.success, true)
      assert.equal(result.data.psfCost, 0.133)
    })
  })

  describe('POST /entry/cost/psf', () => {
    it('should reject when data is incomplete', async () => {
      try {
        const options = {
          method: 'POST',
          url: `${LOCALHOST}/entry/cost/psf`,
          data: {}
        }

        await axios(options)

        assert(false, 'Unexpected result')
      } catch (err) {
        // console.log(err)
        assert(err.response.status === 422, 'Error code 422 expected.')
      }
    })

    // CT 7/7/22: Disabled because I skip token lookup in e2e tests. This code
    // path can be covered by a unit test.
    // it('should get rate for a target date', async () => {
    //   const options = {
    //     method: 'POST',
    //     url: `${LOCALHOST}/entry/cost/psf`,
    //     data: {
    //       targetDate: '06/21/2022'
    //     }
    //   }
    //
    //   const result = await axios(options)
    //   console.log(result.data)
    //
    //   assert.property(result.data, 'success')
    //   assert.property(result.data, 'psfCost')
    //
    //   assert.equal(result.data.success, true)
    //   assert.equal(result.data.psfCost, 0.126)
    // })
  })

  describe('POST /write/bch - Try to write using BCH', () => {
    it('should reject when bch writes are not enabled', async () => {
      try {
        const options = {
          method: 'POST',
          url: `${LOCALHOST}/entry/write/bch`,
          data: {}
        }

        await axios(options)

        assert(false, 'Unexpected result')
      } catch (err) {
        // console.log(err)
        const status = err.response.status
        const statusIs422 = status === 422
        const statusIs501 = status === 501
        const statusIs422Or501 = statusIs422 || statusIs501

        assert.equal(statusIs422Or501, true)
      }
    })
  })

  describe('GET /cost/bch - Get cost for a write in BCH', () => {
    it('should reject when bch writes are not enabled', async () => {
      try {
        const options = {
          method: 'GET',
          url: `${LOCALHOST}/entry/cost/bch`,
          data: {}
        }

        await axios(options)

        assert(false, 'Unexpected result')
      } catch (err) {
        // console.log(err)
        const status = err.response.status
        const statusIs422 = status === 422
        const statusIs501 = status === 501
        const statusIs422Or501 = statusIs422 || statusIs501

        assert.equal(statusIs422Or501, true)
      }
    })
  })
})
