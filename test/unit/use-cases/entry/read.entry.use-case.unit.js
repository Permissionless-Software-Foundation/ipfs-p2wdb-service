/*
  Unit tests for the P2WDB Read Entry Use Cases
*/

const assert = require('chai').assert
const sinon = require('sinon')

const ReadEntry = require('../../../../src/use-cases/entry/read-entry')

// Mocks
// const LocalDB = require('../mocks/localdb-mock')
const P2WDB = require('../../mocks/p2wdb-mock')

let sandbox
let uut
// let rawData

describe('#ReadEntry', () => {
  before(async () => {})

  beforeEach(() => {
    // const localdb = new LocalDB()
    const p2wdbAdapter = new P2WDB()
    uut = new ReadEntry({ p2wdbAdapter })

    sandbox = sinon.createSandbox()
  })

  afterEach(() => sandbox.restore())

  describe('#constructor', () => {
    it('should throw an error if p2wdb instance is not included', () => {
      try {
        uut = new ReadEntry()

        assert.fail('Unexpected code path')
      } catch (err) {
        assert.include(
          err.message,
          'p2wdb instance must be included when instantiating ReadEntry'
        )
      }
    })
  })

  describe('#readAllEntries', () => {
    it('should return P2WDB data', async () => {
      const result = await uut.readAllEntries()
      // console.log('result: ', result)

      // Assert that expected data is coming back from the p2wdb mock.
      assert.property(result, 'key')
      assert.equal(result.key, 'value')
    })

    it('should catch and throw an error', async () => {
      try {
        // Force Error
        sandbox
          .stub(uut.p2wdbAdapter, 'readAll')
          .rejects(new Error('test error'))

        await uut.readAllEntries()

        assert.fail('Unexpected code path')
      } catch (err) {
        assert.include(err.message, 'test error')
      }
    })
  })
})
