/*
  Unit tests for the P2WDB Entry entity library.
*/

const assert = require('chai').assert
const sinon = require('sinon')

const DBEntry = require('../../../src/entities/db-entry')

let sandbox
let uut

describe('#DBEntry', () => {
  before(async () => {})

  beforeEach(() => {
    uut = new DBEntry()

    sandbox = sinon.createSandbox()
  })

  afterEach(() => sandbox.restore())

  describe('#makeUserEntry', () => {
    it('should throw an error if txid is not provided', () => {
      try {
        uut.makeUserEntry()
      } catch (err) {
        assert.include(
          err.message,
          'TXID must be a string containing a transaction ID of proof-of-burn.'
        )
      }
    })

    it('should throw an error if data is not provided', () => {
      try {
        uut.makeUserEntry({ txid: 'test' })
      } catch (err) {
        assert.include(err.message, 'Entry requires an data property.')
      }
    })

    it('should return an Entry object', () => {
      const rawData = {
        hash: 'zdpuAuxCW346zUG71Aai21Y31EJ1XNxcjXV5rz93DxftKnpjn',
        txid:
          '0fc58bdd91ff92cb47387d950a505d934b3776a1b2544ea9b53102d4697ef91f',
        message: 'test',
        signature:
          'IA8LCUnN6TUocSGnCe9nA1T4D+9hurJJ0vi3vBEJvAVwFfGcZ9ZlIWdR1m30wAxO4r0wb3YSzrM3QynpfgKUW/w=',
        data:
          '{"appId":"test","title":"7170","sourceUrl":"63156","ipfsUrl":"73680","timestamp":"2021-06-23T00:26:51.789Z","localTimestamp":"6/22/2021, 5:26:51 PM"}'
      }

      const entry = uut.makeUserEntry(rawData)
      // console.log('entry: ', entry)

      // Assert that the returned object has expected properties.
      assert.property(entry, 'hash')
      assert.property(entry, 'key')
      assert.property(entry, 'isValid')
      assert.property(entry, 'value')
      assert.property(entry.value, 'message')
      assert.property(entry.value, 'signature')
      assert.property(entry.value, 'data')

      // Assert that values match expectations.
      assert.equal(entry.hash, rawData.hash)
      assert.equal(entry.key, rawData.txid)
      assert.equal(entry.isValid, false)
      assert.equal(entry.value.message, rawData.message)
      assert.equal(entry.value.signature, rawData.signature)
      assert.equal(entry.value.data, rawData.data)
    })
  })

  describe('#makePeerEntry', () => {
    it('should return an Entry object', () => {
      const rawData = {
        hash: 'zdpuAuxCW346zUG71Aai21Y31EJ1XNxcjXV5rz93DxftKnpjn',
        txid:
          '0fc58bdd91ff92cb47387d950a505d934b3776a1b2544ea9b53102d4697ef91f',
        message: 'test',
        signature:
          'IA8LCUnN6TUocSGnCe9nA1T4D+9hurJJ0vi3vBEJvAVwFfGcZ9ZlIWdR1m30wAxO4r0wb3YSzrM3QynpfgKUW/w=',
        data:
          '{"appId":"test","title":"7170","sourceUrl":"63156","ipfsUrl":"73680","timestamp":"2021-06-23T00:26:51.789Z","localTimestamp":"6/22/2021, 5:26:51 PM"}'
      }

      const entry = uut.makePeerEntry(rawData)
      // console.log('entry: ', entry)

      // Assert that the returned object has expected properties.
      assert.property(entry, 'hash')
      assert.property(entry, 'key')
      assert.property(entry, 'isValid')
      assert.property(entry, 'value')
      assert.property(entry.value, 'message')
      assert.property(entry.value, 'signature')
      assert.property(entry.value, 'data')

      // Assert that values match expectations.
      assert.equal(entry.hash, rawData.hash)
      assert.equal(entry.key, rawData.txid)
      assert.equal(entry.isValid, true)
      assert.equal(entry.value.message, rawData.message)
      assert.equal(entry.value.signature, rawData.signature)
      assert.equal(entry.value.data, rawData.data)
    })
  })
})
