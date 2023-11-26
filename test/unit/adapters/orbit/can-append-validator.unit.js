/*
  Unit tests for the canAppend() validator used to validate each entry in the
  P2WDB Orbit Database.
*/

// Global npm libraries
import sinon from 'sinon'
import { assert } from 'chai'

// Local libraries
// import config from '../../../../config/index.js'
import WritePrice from '../../../../src/adapters/write-price.js'
import { MockBchWallet } from '../../mocks/adapters/wallet.js'
import P2WCanAppend from '../../../../src/adapters/orbit/can-append-validator.js'

describe('#can-append-validator.js', () => {
  let uut
  let sandbox
  let wallet

  beforeEach(() => {
    wallet = {
      bchWallet: new MockBchWallet()
    }
    const writePrice = new WritePrice()

    uut = new P2WCanAppend({ wallet, writePrice })

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
})
