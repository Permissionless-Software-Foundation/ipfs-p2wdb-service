/*
  Unit tests for the P2WDB Add Entry Use Cases
*/

const assert = require('chai').assert
const sinon = require('sinon')

const AddEntry = require('../../../../src/use-cases/entry/add-entry')

// Mocks
const adaptersMock = require('../../mocks/adapters')

let sandbox
let uut
let rawData

describe('#AddEntry', () => {
  before(async () => {})

  beforeEach(() => {
    uut = new AddEntry({
      p2wdbAdapter: adaptersMock.p2wdb,
      entryAdapter: adaptersMock.entry
    })

    rawData = {
      hash: 'zdpuAuxCW346zUG71Aai21Y31EJ1XNxcjXV5rz93DxftKnpjn',
      txid: '0fc58bdd91ff92cb47387d950a505d934b3776a1b2544ea9b53102d4697ef91f',
      message: 'test',
      signature:
        'IA8LCUnN6TUocSGnCe9nA1T4D+9hurJJ0vi3vBEJvAVwFfGcZ9ZlIWdR1m30wAxO4r0wb3YSzrM3QynpfgKUW/w=',
      data:
        '{"appId":"test","title":"7170","sourceUrl":"63156","ipfsUrl":"73680","timestamp":"2021-06-23T00:26:51.789Z","localTimestamp":"6/22/2021, 5:26:51 PM"}'
    }

    sandbox = sinon.createSandbox()
  })

  afterEach(() => sandbox.restore())

  describe('#constructor', () => {
    it('should throw an error if p2wdb instance is not included', () => {
      try {
        uut = new AddEntry()

        assert.fail('Unexpected code path')
      } catch (err) {
        assert.include(
          err.message,
          'p2wdbAdapter instance must be included when instantiating AddEntry'
        )
      }
    })

    it('should throw an error if entry adapter instance is not included', () => {
      try {
        uut = new AddEntry({ p2wdbAdapter: {} })

        assert.fail('Unexpected code path')
      } catch (err) {
        assert.include(
          err.message,
          'entryAdapter instance must be included when instantiating AddEntry use case'
        )
      }
    })
  })

  describe('#addUserEntry', () => {
    it('should throw an error if entry already exists in the database.', async () => {
      try {
        // Mock dependencies.
        sandbox.stub(uut.entryAdapter, 'doesEntryExist').resolves(true)

        await uut.addUserEntry(rawData)

        assert.fail('Unexpected code path')
      } catch (err) {
        assert.include(err.message, 'Entry already exists in the database.')
      }
    })

    it('should add an entry to the P2WDB', async () => {
      // Mock dependencies
      // console.log('uut.entryAdapter: ', uut.entryAdapter)
      sandbox.stub(uut.entryAdapter, 'doesEntryExist').resolves(false)
      sandbox.stub(uut.p2wdbAdapter, 'insert').resolves('test-hash')

      const result = await uut.addUserEntry(rawData)

      assert.equal(result, 'test-hash')
    })
  })

  describe('#addPeerEntry', () => {
    it('should throw an error if entry already exists in the database.', async () => {
      try {
        // Mock dependencies.
        sandbox.stub(uut.entryAdapter, 'doesEntryExist').resolves(true)

        await uut.addPeerEntry(rawData)

        assert.fail('Unexpected code path')
      } catch (err) {
        assert.include(err.message, 'Entry already exists in the database.')
      }
    })

    it('should add an entry to the P2WDB', async () => {
      // Mock dependencies
      sandbox.stub(uut.entryAdapter, 'doesEntryExist').resolves(false)

      const result = await uut.addPeerEntry(rawData)

      assert.equal(result, true)
    })
  })

  describe('#_extractAppId', () => {
    it('should extract appId from data', () => {
      // Create test data for input.
      const peerData = {
        data: {
          appId: 'test'
        }
      }
      peerData.data = JSON.stringify(peerData.data)

      const result = uut._extractAppId(peerData)
      // console.log('result: ', result)

      assert.equal(result.appId, 'test')
    })

    it('should exit quietly when there is an error, and returns input data.', () => {
      // Create test data for input.
      let peerData = {
        data: {
          appId: 'test'
        }
      }
      peerData = JSON.stringify(peerData)

      const result = uut._extractAppId(peerData)
      // console.log('result: ', result)

      assert.include(result, 'test')
    })
  })
})
