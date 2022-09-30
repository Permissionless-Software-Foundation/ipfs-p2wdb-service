/*
  Unit tests for the pay-to-write access controller for OrbitDB.
*/

const assert = require('chai').assert

const PayToWriteAccessController = require('../../../../src/adapters/orbit/pay-to-write-access-controller')

const sinon = require('sinon')
const mongoose = require('mongoose')

// Local support libraries
const config = require('../../../../config')

const util = require('util')
util.inspect.defaultOptions = { depth: 1 }
const mock = require('../../mocks/pay-to-write-mock')

let sandbox
let uut

describe('#PayToWriteAccessController', () => {
  before(async () => {
    // Connect to the Mongo Database.
    console.log(`Connecting to database: ${config.database}`)
    mongoose.Promise = global.Promise
    mongoose.set('useCreateIndex', true) // Stop deprecation warning.
    await mongoose.connect(config.database, {
      useUnifiedTopology: true,
      useNewUrlParser: true
    })
  })

  beforeEach(async () => {
    uut = new PayToWriteAccessController()
    await uut.initialize()

    sandbox = sinon.createSandbox()
  })

  afterEach(() => sandbox.restore())

  after(() => {
    mongoose.connection.close()
  })

  describe('#initialize', () => {
    it('should initialize the library', async () => {
      // Mock dependencies and force desired code path
      uut.isInitialized = false
      sandbox.stub(uut, 'instanceWallet').resolves()
      uut.wallet = {
        bchjs: {}
      }

      const result = await uut.initialize()

      assert.equal(result, true)
    })
  })

  describe('#instanceWallet', () => {
    it('should return false if wallet is already instantiated', async () => {
      // Mock dependencies and force desired code path
      uut.wallet = true

      const result = await uut.instanceWallet()

      assert.equal(result, false)
    })

    it('should return true after instantiating wallet', async () => {
      // Mock dependencies and force desired code path
      uut.wallet = false
      uut.WalletAdapter = class WalletAdapter {
        async openWallet () { return true }
        async instanceWalletWithoutInitialization () { return true }
      }

      const result = await uut.instanceWallet()

      assert.equal(result, true)
    })
  })

  describe('_validateSignature()', () => {
    it('should throw error if txid input is not provided', async () => {
      try {
        await uut._validateSignature()

        assert(false, 'Unexpected result')
      } catch (err) {
        assert.include(err.message, 'txid must be a string')
      }
    })

    it('should throw error if signature input is not provided', async () => {
      try {
        const txId =
          'dc6a7bd80860f58e392d36f6da0fb32d23eb52f03447c11a472c32b2c1267cd0'
        await uut._validateSignature(txId)

        assert(false, 'Unexpected result')
      } catch (err) {
        assert.include(err.message, 'signature must be a string')
      }
    })

    it('should throw error if message input is not provided', async () => {
      try {
        const txId =
          'dc6a7bd80860f58e392d36f6da0fb32d23eb52f03447c11a472c32b2c1267cd0'
        const signature =
          'H+S7OTnqZzs34lAJW4DPvCkLIv4HlR1wBux7x2OxmeiCVJ8xDmo3jcHjtWc4N9mdBVB4VUSPRt9Ete9wVVDzDeI='

        await uut._validateSignature(txId, signature)

        assert(false, 'Unexpected result')
      } catch (err) {
        assert.include(err.message, 'message must be a string')
      }
    })

    it('should return false for invalid signature', async () => {
      // Mock
      sandbox.stub(uut.wallet, 'getTxData').resolves([mock.tx])

      const txId =
        'dc6a7bd80860f58e392d36f6da0fb32d23eb52f03447c11a472c32b2c1267cd0'
      const signature =
        'H+S7OTnqZzs34lAJW4DPvCkLIv4HlR1wBux7x2OxmeiCVJ8xDmo3jcHjtWc4N9mdBVB4VUSPRt9Ete9wVVDzDeI='
      const message = 'wrong message'

      const result = await uut._validateSignature(txId, signature, message)

      assert.isFalse(result)
    })

    it('should return true for valid signature', async () => {
      // Mock
      sandbox.stub(uut.wallet, 'getTxData').resolves([mock.tx])

      const txId =
        'dc6a7bd80860f58e392d36f6da0fb32d23eb52f03447c11a472c32b2c1267cd0'
      const signature =
        'H+S7OTnqZzs34lAJW4DPvCkLIv4HlR1wBux7x2OxmeiCVJ8xDmo3jcHjtWc4N9mdBVB4VUSPRt9Ete9wVVDzDeI='
      const message = 'A message'

      const result = await uut._validateSignature(txId, signature, message)

      assert.isTrue(result)
    })

    it('should throw error if TX can not be retrieved', async () => {
      try {
      // Mock
        sandbox.stub(uut.wallet, 'getTxData').resolves()

        const txId =
        'dc6a7bd80860f58e392d36f6da0fb32d23eb52f03447c11a472c32b2c1267cd0'
        const signature =
        'H+S7OTnqZzs34lAJW4DPvCkLIv4HlR1wBux7x2OxmeiCVJ8xDmo3jcHjtWc4N9mdBVB4VUSPRt9Ete9wVVDzDeI='
        const message = 'A message'

        await uut._validateSignature(txId, signature, message)

        assert.fail('Unexpected code path')
      } catch (err) {
        assert.include(err.message, 'Could not get transaction details from BCH service.')
      }
    })
  })

  describe('#_validateTx', () => {
    it('should throw error if txid is not provided', async () => {
      try {
        await uut._validateTx()
        assert.fail('Unexpected code path')
      } catch (err) {
        assert.include(err.message, 'txid must be a string')
      }
    })

    it('should throw error if txid is not a string', async () => {
      try {
        await uut._validateTx(1)
        assert.fail('Unexpected code path')
      } catch (err) {
        assert.include(err.message, 'txid must be a string')
      }
    })

    it('should catch bchjs error', async () => {
      try {
        // Force an error
        sandbox
          .stub(uut.wallet, 'getTxData')
          .rejects(new Error('some error message'))

        const txId = mock.tx.txid
        await uut._validateTx(txId)

        assert.fail('Unexpected code path')
      } catch (err) {
        assert.include(err.message, 'some error message')
      }
    })

    it('should return false if txid is not a valid SLP tx', async () => {
      try {
        sandbox.stub(uut.wallet, 'getTxData').resolves([{ isValidSlp: false }])

        const txId = mock.tx.txid
        const result = await uut._validateTx(txId)
        assert.isFalse(result)
      } catch (err) {
        assert.fail('Unexpected code path')
      }
    })

    it('should return false if tokenId does not match', async () => {
      try {
        sandbox
          .stub(uut.wallet, 'getTxData')
          .resolves([{ isValidSlp: true, tokenId: 'wrong-id' }])

        const txId = mock.tx.txid
        const result = await uut._validateTx(txId)
        assert.isFalse(result)
      } catch (err) {
        // console.log('err: ', err)
        assert.fail('Unexpected code path')
      }
    })

    it('should throw error if tokenId is not included', async () => {
      try {
        sandbox
          .stub(uut.wallet, 'getTxData')
          .resolves([{ isValidSlp: true, tokenId: '' }])

        const txId = mock.tx.txid
        await uut._validateTx(txId)

        assert.fail('Unexpected code path')
      } catch (err) {
        // console.log('err: ', err)
        assert.include(err.message, 'Transaction data does not include a token ID.')
      }
    })

    it('should return false if token burn is less than the threshold', async () => {
      // const spy = sinon.spy(uut, 'getTokenQtyDiff')
      sandbox.stub(uut.wallet, 'getTxData').resolves([
        {
          tokenId:
              '38e97c5d7d3585a2cbf3f9580c82ca33985f9cb0845d4dcce220cb709f9538b0',
          isValidSlp: true
        }
      ])
      // sandbox.stub(uut.bchjs.Transaction, 'get').resolves(mock.txInfo)
      sandbox.stub(uut, 'getTokenQtyDiff').resolves(0.0001)

      // Mock data
      const now = new Date()
      const entry = {
        payload: {
          value: {
            timestamp: now.getTime()
          }
        }
      }
      uut._options.writePrice = {
        getTargetCostPsf: () => 0.133
      }

      const txId = mock.tx.txid
      const result = await uut._validateTx(txId, entry)

      assert.isFalse(result)
    })

    it('should return true if required tokens are burned', async () => {
      uut.config.reqTokenQty = 0
      sandbox.stub(uut.wallet, 'getTxData').resolves([
        {
          tokenId:
            '38e97c5d7d3585a2cbf3f9580c82ca33985f9cb0845d4dcce220cb709f9538b0',
          isValidSlp: true,
          vin: [],
          vout: []
        }
      ])
      // sandbox.stub(uut.bchjs.Transaction, 'get').resolves(mock.txInfo)
      sandbox.stub(uut, 'getTokenQtyDiff').resolves(0.5)

      // Mock data
      const now = new Date()
      const entry = {
        payload: {
          value: {
            timestamp: now.getTime()
          }
        }
      }
      uut._options.writePrice = {
        getTargetCostPsf: () => 0.133
      }

      const txId = mock.tx.txid
      const result = await uut._validateTx(txId, entry)
      assert.isTrue(result)
    })

    it('should display complete error if it has no message', async () => {
      try {
        sandbox
          .stub(uut.wallet, 'getTxData')
          .rejects({ a: 'b' })

        const txId = mock.tx.txid
        await uut._validateTx(txId)

        assert.fail('Unexpected code path')
      } catch (err) {
        // console.log('err: ', err)
        // assert.include(err.message, 'Transaction data does not include a token ID.')
        assert.equal(err.a, 'b')
      }
    })

    it('should repackage errors with an error property', async () => {
      try {
        sandbox
          .stub(uut.wallet, 'getTxData')
          .rejects({ error: 'test error' })

        const txId = mock.tx.txid
        await uut._validateTx(txId)

        assert.fail('Unexpected code path')
      } catch (err) {
        // console.log('err: ', err)
        // assert.include(err.message, 'Transaction data does not include a token ID.')
        assert.equal(err.message, 'test error')
      }
    })

    // it('should handle nginx 429 errors', async () => {
    //   try {
    //     sandbox
    //       .stub(uut.wallet, 'getTxData')
    //       .rejects({ a: '429 Too Many Requests' })
    //
    //     const txId = mock.tx.txid
    //     await uut._validateTx(txId)
    //
    //     assert.fail('Unexpected code path')
    //   } catch (err) {
    //     // console.log('err: ', err)
    //     // assert.include(err.message, 'Transaction data does not include a token ID.')
    //     assert.equal(err.message, 'nginx: 429 Too Many Requests')
    //   }
    // })
  })

  describe('#getTokenQtyDiff', () => {
    it('should throw error if input is not provided', async () => {
      try {
        await uut.getTokenQtyDiff()
        assert.fail('Unexpected code path')
      } catch (err) {
        assert.include(err.message, 'txInfo is required')
      }
    })

    it('should throw error if txinfo is invalid format', async () => {
      try {
        await uut.getTokenQtyDiff(1)
        assert.fail('Unexpected code path')
      } catch (err) {
        assert.include(err.message, 'txInfo must contain vin and vout array')
      }
    })

    it('should get tokenqty difference between vin and vout arrays', async () => {
      try {
        const diff = await uut.getTokenQtyDiff(mock.txInfo)
        assert.isNumber(diff)
      } catch (err) {
        assert.fail('Unexpected code path')
      }
    })
  })

  describe('#markInvalid', () => {
    it('should throw error if input is not provided', async () => {
      try {
        await uut.markInvalid()
        assert.fail('Unexpected code path')
      } catch (err) {
        assert.include(err.message, 'txid must be a string')
      }
    })

    it('should throw error if txid is not a string', async () => {
      try {
        await uut.markInvalid(1)
        assert.fail('Unexpected code path')
      } catch (err) {
        assert.include(err.message, 'txid must be a string')
      }
    })

    it('should create a new entry in MongoDB', async () => {
      try {
        const txId = mock.tx.txid
        const keyValue = await uut.markInvalid(txId)

        assert.isFalse(keyValue.isValid)
        assert.equal(keyValue.key, txId)
      } catch (err) {
        assert.fail('Unexpected code path')
      }
    })
  })

  describe('#matchErrorMsg', () => {
    it('should return false if input is missing', () => {
      const errMsg = undefined
      const result = uut.matchErrorMsg(errMsg)

      assert.equal(result, false)
    })

    it('should return false if input is wrong type', () => {
      const errMsg = {}
      const result = uut.matchErrorMsg(errMsg)

      assert.equal(result, false)
    })

    it('should return false if no error message is matched', () => {
      const result = uut.matchErrorMsg('test message')

      assert.equal(result, false)
    })

    it('should return true for no-tx error', () => {
      const result = uut.matchErrorMsg(
        'No such mempool or blockchain transaction'
      )

      assert.equal(result, true)
    })
  })

  describe('#validateAgainstBlockchain', () => {
    it('should throw error if input is missing', async () => {
      try {
        await uut.validateAgainstBlockchain()
        assert.fail('unexpected code path')
      } catch (err) {
        assert.include(err.message, 'Cannot destructure property')
      }
    })

    it('should throw error if input is wrong type', async () => {
      try {
        await uut.validateAgainstBlockchain(1)
        assert.fail('unexpected code path')
      } catch (err) {
        assert.include(err.message, 'input must be an object')
      }
    })

    it('should throw error if "txid" property is not provided', async () => {
      try {
        await uut.validateAgainstBlockchain({})
        assert.fail('unexpected code path')
      } catch (err) {
        assert.include(err.message, 'txid must be a string')
      }
    })

    it('should throw error if "signature" property is not provided', async () => {
      try {
        const obj = {
          txid: 'dc6a7bd80860f58e392d36f6da0fb32d23eb52f03447c11a472c32b2c1267cd0'
        }
        await uut.validateAgainstBlockchain(obj)
        assert.fail('unexpected code path')
      } catch (err) {
        assert.include(err.message, 'signature must be a string')
      }
    })

    it('should throw error if "message" property is not provided', async () => {
      try {
        const obj = {
          txid: 'dc6a7bd80860f58e392d36f6da0fb32d23eb52f03447c11a472c32b2c1267cd0',
          signature:
            'S7OTnqZzs34lAJW4DPvCkLIv4HlR1wBux7x2OxmeiCVJ8xDmo3jcHjtWc4N9mdBVB4VUSPRt9Ete9wVVDzDeI'
        }
        await uut.validateAgainstBlockchain(obj)
        assert.fail('unexpected code path')
      } catch (err) {
        assert.include(err.message, 'message must be a string')
      }
    })

    it('should return false for invalid signature', async () => {
      // Mock
      sandbox.stub(uut, '_validateSignature').resolves(false)

      const obj = {
        txid: 'dc6a7bd80860f58e392d36f6da0fb32d23eb52f03447c11a472c32b2c1267cd0',
        signature:
          'S7OTnqZzs34lAJW4DPvCkLIv4HlR1wBux7x2OxmeiCVJ8xDmo3jcHjtWc4N9mdBVB4VUSPRt9Ete9wVVDzDeI',
        message: 'message'
      }
      const result = await uut.validateAgainstBlockchain(obj)
      assert.isFalse(result)
    })

    it('should catch known error messages and mark the entry as invalid in Mongo', async () => {
      sandbox
        .stub(uut, '_validateSignature')
        .throws(new Error('No such mempool or blockchain transaction'))

      const obj = {
        txid: 'dc6a7bd80860f58e392d36f6da0fb32d23eb52f03447c11a472c32b2c1267cd0',
        signature:
          'S7OTnqZzs34lAJW4DPvCkLIv4HlR1wBux7x2OxmeiCVJ8xDmo3jcHjtWc4N9mdBVB4VUSPRt9Ete9wVVDzDeI',
        message: 'message'
      }
      const result = await uut.validateAgainstBlockchain(obj)
      assert.isFalse(result)
    })

    it('should return return true on successful validation', async () => {
      sandbox.stub(uut, '_validateSignature').resolves(true)

      sandbox.stub(uut, '_validateTx').resolves(true)

      const obj = {
        txid: 'dc6a7bd80860f58e392d36f6da0fb32d23eb52f03447c11a472c32b2c1267cd0',
        signature:
          'S7OTnqZzs34lAJW4DPvCkLIv4HlR1wBux7x2OxmeiCVJ8xDmo3jcHjtWc4N9mdBVB4VUSPRt9Ete9wVVDzDeI',
        message: 'message'
      }
      const result = await uut.validateAgainstBlockchain(obj)
      assert.isTrue(result)
    })
  })

  describe('#canAppend', () => {
    it('should return false on error handled', async () => {
      sandbox.stub(uut.retryQueue, 'addToQueue').throws(new Error())

      const result = await uut.canAppend(mock.entryMaxSize)
      assert.isFalse(result)
    })

    it('should return false if input missing', async () => {
      const result = await uut.canAppend()
      assert.isFalse(result)
    })

    it('should return false if the input data is greater than the maxDataSize', async () => {
      const result = await uut.canAppend(mock.entryMaxSize)
      assert.isFalse(result)
    })

    it('should return value in MongoDB if entry already exists in the database', async () => {
      sandbox.stub(uut.KeyValue, 'find').resolves([{ isValid: true }])

      const result = await uut.canAppend(mock.entry)
      assert.isTrue(result)
    })

    it('should return true if blockchain validation passes', async () => {
      sandbox.stub(uut.retryQueue, 'addToQueue').resolves(true)
      sandbox.stub(uut.bchjs.Util, 'sleep').resolves()

      const result = await uut.canAppend(mock.entry)
      assert.isTrue(result)
    })

    it('should emit event if hash exist for valid tx', async () => {
      let eventInput

      sandbox.stub(uut.retryQueue, 'addToQueue').resolves(true)
      sandbox.stub(uut.bchjs.Util, 'sleep').resolves()

      sandbox
        .stub(uut.validationEvent, 'emit')
        .callsFake((eventName, value) => {
          eventInput = value
        })

      const entry = mock.entry
      entry.hash = 'hash'
      const result = await uut.canAppend(entry)

      assert.isTrue(result)

      assert.isObject(eventInput, 'An object is expected to be emited')
      assert.equal(eventInput.hash, entry.hash)
      assert.equal(eventInput.data, entry.payload.value.data)
    })

    it('should return false if entry is older than a year', async () => {
      sandbox.stub(uut, 'checkDate').resolves(false)

      const result = await uut.canAppend(mock.entry)
      assert.isFalse(result)
    })
  })

  describe('#checkDate', () => {
    it('should return false if date is less than a year old', () => {
      const now = new Date()
      const target = now.getTime() - 60000 * 60 * 24 * 2

      const payload = {
        value: {
          timestamp: target
        }
      }

      const result = uut.checkDate(payload)

      assert.equal(result, false)
    })

    it('should return true if date is more than a year old', () => {
      const now = new Date()
      const target = now.getTime() - 60000 * 60 * 24 * 400

      const payload = {
        value: {
          timestamp: target
        }
      }

      const result = uut.checkDate(payload)

      assert.equal(result, true)
    })
  })
})
