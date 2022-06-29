/*
  Unit tests for the P2WDB Cost Use Cases
*/

const assert = require('chai').assert
const sinon = require('sinon')

const Cost = require('../../../../src/use-cases/entry/cost')

// Mocks
const adaptersMock = require('../../mocks/adapters')

let sandbox
let uut

describe('#Cost', () => {
  before(async () => {})

  beforeEach(() => {
    uut = new Cost({
      adapters: adaptersMock
    })

    sandbox = sinon.createSandbox()
  })

  afterEach(() => sandbox.restore())

  describe('#constructor', () => {
    it('should throw an error if adapters instance is not included', () => {
      try {
        uut = new Cost()

        assert.fail('Unexpected code path')
      } catch (err) {
        assert.include(
          err.message,
          'Instance of adapters must be passed in when instantiating Cost Use Cases library.'
        )
      }
    })
  })

  describe('#getPsfCost', () => {
    it('should get the current write cost in PSF tokens', () => {
      const result = uut.getPsfCost()
      // console.log('result: ', result)

      assert.equal(result, 0.133)
    })
  })

  describe('#getPsfCostTarget', () => {
    it('should get the write value for a target date', async () => {
      const targetDate = '06/21/2022'

      const result = await uut.getPsfCostTarget(targetDate)

      assert.equal(result, 0.133)
    })
  })

  // describe('#addUserEntry', () => {
  //   it('should throw an error if entry already exists in the database.', async () => {
  //     try {
  //       // Mock dependencies.
  //       sandbox.stub(uut.entryAdapter, 'doesEntryExist').resolves(true)
  //
  //       await uut.addUserEntry(rawData)
  //
  //       assert.fail('Unexpected code path')
  //     } catch (err) {
  //       assert.include(err.message, 'Entry already exists in the database.')
  //     }
  //   })
  //
  //   it('should add an entry to the P2WDB', async () => {
  //     // Mock dependencies
  //     // console.log('uut.entryAdapter: ', uut.entryAdapter)
  //     sandbox.stub(uut.entryAdapter, 'doesEntryExist').resolves(false)
  //     sandbox.stub(uut.p2wdbAdapter, 'insert').resolves('test-hash')
  //
  //     const result = await uut.addUserEntry(rawData)
  //
  //     assert.equal(result, 'test-hash')
  //   })
  // })

  // describe('#addPeerEntry', () => {
  //   it('should throw an error if entry already exists in the database.', async () => {
  //     try {
  //       // Mock dependencies.
  //       sandbox.stub(uut.entryAdapter, 'doesEntryExist').resolves(true)
  //
  //       await uut.addPeerEntry(rawData)
  //
  //       assert.fail('Unexpected code path')
  //     } catch (err) {
  //       assert.include(err.message, 'Entry already exists in the database.')
  //     }
  //   })
  //
  //   it('should add an entry to the P2WDB', async () => {
  //     // Mock dependencies
  //     sandbox.stub(uut.entryAdapter, 'doesEntryExist').resolves(false)
  //
  //     const result = await uut.addPeerEntry(rawData)
  //
  //     assert.equal(result, true)
  //   })
  // })

  // describe('#_extractAppId', () => {
  //   it('should extract appId from data', () => {
  //     // Create test data for input.
  //     const peerData = {
  //       data: {
  //         appId: 'test'
  //       }
  //     }
  //     peerData.data = JSON.stringify(peerData.data)
  //
  //     const result = uut._extractAppId(peerData)
  //     // console.log('result: ', result)
  //
  //     assert.equal(result.appId, 'test')
  //   })
  //
  //   it('should exit quietly when there is an error, and returns input data.', () => {
  //     // Create test data for input.
  //     let peerData = {
  //       data: {
  //         appId: 'test'
  //       }
  //     }
  //     peerData = JSON.stringify(peerData)
  //
  //     const result = uut._extractAppId(peerData)
  //     // console.log('result: ', result)
  //
  //     assert.include(result, 'test')
  //   })
  // })
})
