/*
  Unit tests for the canAppend() validator used to validate each entry in the
  P2WDB Orbit Database.
*/

// Global npm libraries
import sinon from 'sinon'
import { assert } from 'chai'
import cloneDeep from 'lodash.clonedeep'

// Local libraries
// import config from '../../../../config/index.js'
import WritePrice from '../../../../src/adapters/write-price.js'
import { MockBchWallet } from '../../mocks/adapters/wallet.js'
import P2WCanAppend from '../../../../src/adapters/orbit/can-append-validator.js'
import mockDataLib from '../../mocks/can-append-mock.js'

describe('#can-append-validator.js', () => {
  let uut
  let sandbox
  let wallet
  let mockData

  beforeEach(() => {
    wallet = {
      bchWallet: new MockBchWallet()
    }
    const writePrice = new WritePrice()

    uut = new P2WCanAppend({ wallet, writePrice })

    mockData = cloneDeep(mockDataLib)

    sandbox = sinon.createSandbox()
  })

  afterEach(() => sandbox.restore())

  describe('#constructor', () => {
    it('should throw error if wallet is not supplied', async () => {
      try {
        uut = new P2WCanAppend()

        assert.fail('Unexpected code path')
        console.log(uut) // This line makes the linter happy
      } catch (err) {
        assert.include(err.message, 'Instance of wallet required when instantiating can-append-validator.js')
      }
    })

    it('should throw error if write price adapter is not supplied', async () => {
      try {
        uut = new P2WCanAppend({ wallet })

        assert.fail('Unexpected code path')
        console.log(uut) // This line makes the linter happy
      } catch (err) {
        assert.include(err.message, 'PSF Write price required when instantiating can-append-validator.js')
      }
    })
  })

  describe('#validateEntry', () => {
    it('should throw error if key property does not exist in entry', () => {
      try {
        uut.validateEntry({ payload: {} })

        assert.fail('Unexpected code path')
      } catch (err) {
        assert.include(err.message, ('Entry has no valid payload.key property.'))
      }
    })

    it('should throw error if value object does not exist in entry', () => {
      try {
        uut.validateEntry({ payload: { key: 'foo' } })

        assert.fail('Unexpected code path')
      } catch (err) {
        assert.include(err.message, ('Entry has no valid payload.value property.'))
      }
    })

    it('should throw error if message does not exist in entry', () => {
      try {
        uut.validateEntry({ payload: { key: 'foo', value: {} } })

        assert.fail('Unexpected code path')
      } catch (err) {
        assert.include(err.message, ('Entry has no valid payload.value.message property.'))
      }
    })

    it('should throw error if signature does not exist in entry', () => {
      try {
        uut.validateEntry({ payload: { key: 'foo', value: { message: 'bar' } } })

        assert.fail('Unexpected code path')
      } catch (err) {
        assert.include(err.message, ('Entry has no valid payload.value.signature property.'))
      }
    })

    it('should throw error if data does not exist in entry', () => {
      try {
        uut.validateEntry({ payload: { key: 'foo', value: { message: 'bar', signature: 'baz' } } })

        assert.fail('Unexpected code path')
      } catch (err) {
        assert.include(err.message, ('Entry has no valid payload.key.value.data property.'))
      }
    })

    it('should return true if entry has all expected properties', () => {
      const result = uut.validateEntry({ payload: { key: 'foo', value: { message: 'bar', signature: 'baz', data: {} } } })

      assert.equal(result, true)
    })
  })

  describe('#checkDate', () => {
    it('should return false if payload timestamp is less than a year old', () => {
      const now = new Date()
      const payload = {
        value: {
          timestamp: now.getTime()
        }
      }

      const result = uut.checkDate(payload)

      assert.equal(result, false)
    })

    it('should return true if payload timestamp is older than a year', () => {
      const now = new Date()
      const oneYear = 60000 * 60 * 24 * 365
      const payload = {
        value: {
          timestamp: now.getTime() - oneYear - 10000
        }
      }

      const result = uut.checkDate(payload)

      assert.equal(result, true)
    })
  })

  describe('#_validateSignature', () => {
    it('should throw error if txData is not included', async () => {
      try {
        await uut._validateSignature()

        assert.fail('Unexpected code path')
      } catch (err) {
        assert.include(err.message, 'txData must be an object containing tx data')
      }
    })

    it('should throw error if signature is not a string', async () => {
      try {
        await uut._validateSignature({}, 4, 4)

        assert.fail('Unexpected code path')
      } catch (err) {
        assert.include(err.message, 'signature must be a string')
      }
    })

    it('should throw error if signature is not a string', async () => {
      try {
        await uut._validateSignature({}, 'fake-signature', 4)

        assert.fail('Unexpected code path')
      } catch (err) {
        assert.include(err.message, 'message must be a string')
      }
    })

    it('should return true for valid signature and tx', async () => {
      const message = '2023-11-22T03:39:16.238Z'
      const signature = 'IDI1M9rGrj0az6k1d29nuPmfKw2+M85ONMBvw/3qtP4pOt/HcN8Kyrzthzufp9Fimah236GISkuFLzA19A4AIOk='
      const txData = mockData.validTx01

      const result = await uut._validateSignature(txData, signature, message)

      assert.equal(result, true)
    })

    it('should return false for invalid signature', async () => {
      const message = '2023-11-22T03:39:16.238Z'
      // Signature from different address.
      const signature = 'H/H/2+vOmYq5J8X+3UMejQ5jzs7lyGu34EU/la6t0X0AHIMXaA6aqmf3s19qPZcrMin/iMPg1jcwaD9DGObK3DI='
      const txData = mockData.validTx01

      const result = await uut._validateSignature(txData, signature, message)

      assert.equal(result, false)
    })

    it('should throw error for damaged signature', async () => {
      try {
        const message = '2023-11-22T03:39:16.238Z'
        // Damaged signature
        const signature = 'IDI1M9rGrj0az6k1d290000fKw2+M85ONMBvw/3qtP4pOt/HcN8Kyrzthzufp9Fimah236GISkuFLzA19A4AIOk='
        const txData = mockData.validTx01

        await uut._validateSignature(txData, signature, message)

        assert.fail('Unexpected code path')
      } catch (err) {
        assert.include(err.message, 'recover public key from signature')
      }
    })
  })

  describe('#_getTokenQtyDiff', () => {
    it('should throw error if TX data is not provided', () => {
      try {
        uut._getTokenQtyDiff()

        assert.fail('Unexpected code path')
      } catch (err) {
        assert.include(err.message, 'txInfo is required')
      }
    })

    it('should throw error if TX data does not have vin or vout arrays', () => {
      try {
        uut._getTokenQtyDiff({})

        assert.fail('Unexpected code path')
      } catch (err) {
        assert.include(err.message, 'txInfo must contain vin and vout array')
      }
    })

    it('should return the difference of a token burn', () => {
      const result = uut._getTokenQtyDiff(mockData.validTx01)
      // console.log('result: ', result)

      assert.equal(result, 0.08335233)
    })

    it('should handle TXs without a tokenQty', () => {
      mockData.validTx01.vin[0].tokenQty = null
      mockData.validTx01.vout[1].tokenQty = null

      const result = uut._getTokenQtyDiff(mockData.validTx01)
      // console.log('result: ', result)

      assert.equal(result, 0)
    })
  })

  describe('#_validateTx', () => {
    it('should throw error if TX data is not provided', async () => {
      try {
        await uut._validateTx()

        assert.fail('Unexpected code path')
      } catch (err) {
        assert.include(err.message, 'txData must be an object containing tx data')
      }
    })

    it('should return false if TX is not a valid SLP TX', async () => {
      mockData.validTx01.isValidSlp = false

      const result = await uut._validateTx(mockData.validTx01, mockData.validEntry01)

      assert.equal(result, false)
    })

    it('should throw error if TX data does not include a token ID', async () => {
      try {
        mockData.validTx01.tokenId = undefined

        await uut._validateTx(mockData.validTx01, mockData.validEntry01)

        assert.fail('Unexpected code path')
      } catch (err) {
        assert.include(err.message, 'Transaction data does not include a token ID.')
      }
    })

    it('should return false if TX consumed the wrong token', async () => {
      mockData.validTx01.tokenId = 'fake-token-id'

      const result = await uut._validateTx(mockData.validTx01, mockData.validEntry01)

      assert.equal(result, false)
    })

    it('should return true for a valid burn TX', async () => {
      const result = await uut._validateTx(mockData.validTx01, mockData.validEntry01)

      assert.equal(result, true)
    })
  })

  describe('#validateAgainstBlockchain', () => {
    it('should throw error if txid is not included in input object', async () => {
      try {
        await uut.validateAgainstBlockchain()

        assert.fail('Unexpected code path')
      } catch (err) {
        assert.include(err.message, 'txid must be a string')
      }
    })

    it('should throw error if signature is not included in input object', async () => {
      try {
        await uut.validateAgainstBlockchain({
          txid: 'fake-txid'
        })

        assert.fail('Unexpected code path')
      } catch (err) {
        assert.include(err.message, 'signature must be a string')
      }
    })

    it('should throw error if message is not included in input object', async () => {
      try {
        await uut.validateAgainstBlockchain({
          txid: 'fake-txid',
          signature: 'fake-sig'
        })

        assert.fail('Unexpected code path')
      } catch (err) {
        assert.include(err.message, 'message must be a string')
      }
    })

    it('should throw error if TX can not be retrieved from Cash Stack', async () => {
      try {
        // Force error
        sandbox.stub(uut.wallet.bchWallet, 'getTxData').resolves(undefined)

        await uut.validateAgainstBlockchain({
          txid: 'fake-txid',
          signature: 'fake-sig',
          message: 'fake-message'
        })

        assert.fail('Unexpected code path')
      } catch (err) {
        assert.include(err.message, 'Could not get transaction details from BCH service.')
      }
    })

    it('should return false for a TX with an invalide signature', async () => {
      // Mock dependencies
      sandbox.stub(uut.wallet.bchWallet, 'getTxData').resolves([mockData.validTx01])
      sandbox.stub(uut, '_validateSignature').resolves(false)

      const result = await uut.validateAgainstBlockchain({
        txid: 'fake-txid',
        signature: 'fake-sig',
        message: 'fake-message'
      })

      assert.equal(result, false)
    })

    it('should return false for TX not matching burning rules', async () => {
      // Mock dependencies
      sandbox.stub(uut.wallet.bchWallet, 'getTxData').resolves([mockData.validTx01])
      sandbox.stub(uut, '_validateSignature').resolves(true)
      sandbox.stub(uut, '_validateTx').resolves(false)

      const result = await uut.validateAgainstBlockchain({
        txid: 'fake-txid',
        signature: 'fake-sig',
        message: 'fake-message'
      })

      assert.equal(result, false)
    })

    it('should return true for a valid TX', async () => {
      // Mock dependencies
      sandbox.stub(uut.wallet.bchWallet, 'getTxData').resolves([mockData.validTx01])
      sandbox.stub(uut, '_validateSignature').resolves(true)
      sandbox.stub(uut, '_validateTx').resolves(true)

      const result = await uut.validateAgainstBlockchain({
        txid: 'fake-txid',
        signature: 'fake-sig',
        message: 'fake-message'
      })

      assert.equal(result, true)
    })

    it('should return false if TX can not be found, and mark entry as invalid', async () => {
      // Mock dependencies
      sandbox.stub(uut.wallet.bchWallet, 'getTxData').rejects(new Error('No such mempool or blockchain transaction'))
      sandbox.stub(uut, 'markInvalid').resolves()

      const result = await uut.validateAgainstBlockchain({
        txid: 'fake-txid',
        signature: 'fake-sig',
        message: 'fake-message'
      })

      assert.equal(result, false)
    })
  })

  describe('#markInvalid', () => {
    it('should throw error if txid is not included', async () => {
      try {
        await uut.markInvalid()

        assert.fail('Unexpected code path')
      } catch (err) {
        assert.include(err.message, 'txid must be a string')
      }
    })

    it('should mark the entry in the database as invalid', async () => {
      // Mock dependencies
      uut.KeyValue = class {
        constructor () {
          this.dummy = true
          this.save = async () => {}
        }
      }

      const result = await uut.markInvalid('fake-txid')

      assert.equal(result.dummy, true)
    })
  })

  describe('#markValid', () => {
    it('should throw error if txid is not included', async () => {
      try {
        await uut.markValid()

        assert.fail('Unexpected code path')
      } catch (err) {
        assert.include(err.message, 'txid must be a string')
      }
    })

    it('should mark the entry in the database as invalid', async () => {
      // Mock dependencies
      uut.KeyValue = class {
        constructor () {
          this.dummy = true
          this.save = async () => {}
        }
      }

      const inObj = {
        txid: 'fake-txid',
        signature: 'fake-sig',
        message: 'fake-message',
        entry: {}
      }

      const result = await uut.markValid(inObj)

      assert.equal(result.dummy, true)
    })
  })

  describe('#canAppend', () => {
    it('should return true on a valid entry', async () => {
      // Mock dependencies
      sandbox.stub(uut, 'validateEntry').returns()
      sandbox.stub(uut.KeyValue, 'find').resolves([])
      sandbox.stub(uut, 'checkDate').returns(false)
      sandbox.stub(uut.retryQueue, 'addToQueue').resolves(true)
      mockData.validEntry01.hash = undefined
      sandbox.stub(uut.validationEvent, 'emit').returns()

      const result = await uut.canAppend(mockData.validEntry01)

      assert.equal(result, true)
    })

    it('should return false data exceeds maximum size', async () => {
      // Mock dependencies
      sandbox.stub(uut, 'validateEntry').returns()

      // Force data to be too big
      const originalConfig = uut.config.maxDataSize
      uut.config.maxDataSize = 1

      const result = await uut.canAppend(mockData.validEntry01)

      assert.equal(result, false)

      uut.config.maxDataSize = originalConfig
    })

    it('should return false if entry is older than a year', async () => {
      // Mock dependencies
      sandbox.stub(uut, 'validateEntry').returns()
      sandbox.stub(uut.KeyValue, 'find').resolves([])
      sandbox.stub(uut, 'checkDate').returns(true)

      const result = await uut.canAppend(mockData.validEntry01)

      assert.equal(result, false)
    })

    it('should return value from MongoDB if entry has already been evaluated', async () => {
      // Mock dependencies
      sandbox.stub(uut, 'validateEntry').returns()
      sandbox.stub(uut.KeyValue, 'find').resolves([{ isValid: false }])

      const result = await uut.canAppend(mockData.validEntry01)

      assert.equal(result, false)
    })

    it('should delay validation if TX just happened', async () => {
      // Mock dependencies
      sandbox.stub(uut, 'validateEntry').returns()
      sandbox.stub(uut.KeyValue, 'find').resolves([])
      sandbox.stub(uut, 'checkDate').returns(false)
      sandbox.stub(uut.retryQueue, 'addToQueue').resolves(true)
      mockData.validEntry01.hash = undefined
      sandbox.stub(uut.validationEvent, 'emit').returns()
      sandbox.stub(uut.bchjs.Util, 'sleep').resolves()

      // Force timestamp to have the current date.
      mockData.validEntry01.payload.value.timestamp = new Date()

      const result = await uut.canAppend(mockData.validEntry01)

      assert.equal(result, true)
    })

    it('should trigger PeerEntryAdded event if entry has a hash', async () => {
      // Mock dependencies
      sandbox.stub(uut, 'validateEntry').returns()
      sandbox.stub(uut.KeyValue, 'find').resolves([])
      sandbox.stub(uut, 'checkDate').returns(false)
      sandbox.stub(uut.retryQueue, 'addToQueue').resolves(true)
      sandbox.stub(uut.validationEvent, 'emit').returns()

      const result = await uut.canAppend(mockData.validEntry01)

      assert.equal(result, true)
    })

    it('should return false if there is an error', async () => {
      // Force an error
      sandbox.stub(uut, 'validateEntry').throws(new Error('test error'))

      const result = await uut.canAppend(mockData.validEntry01)

      assert.equal(result, false)
    })
  })
})
