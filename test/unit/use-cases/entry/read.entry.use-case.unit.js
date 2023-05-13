import chai from 'chai'
import sinon from 'sinon'
import ReadEntry from '../../../../src/use-cases/entry/read-entry.js'
import P2WDB from '../../mocks/p2wdb-mock.js'
/*
  Unit tests for the P2WDB Read Entry Use Cases
*/
const assert = chai.assert
let sandbox
let uut
// let rawData
describe('#ReadEntry', () => {
  before(async () => { })
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
        assert.include(err.message, 'p2wdb instance must be included when instantiating ReadEntry')
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
  describe('#readByHash', () => {
    it('should return P2WDB data', async () => {
      const result = await uut.readByHash('test')
      // console.log('result: ', result)
      // Assert that expected data is coming back from the p2wdb mock.
      assert.property(result, 'data')
    })
    it('should catch and throw an error', async () => {
      try {
        // Force Error
        sandbox
          .stub(uut.p2wdbAdapter, 'readByHash')
          .rejects(new Error('test error'))
        await uut.readByHash()
        assert.fail('Unexpected code path')
      } catch (err) {
        assert.include(err.message, 'test error')
      }
    })
  })
  describe('#readByTxid', () => {
    it('should return P2WDB data', async () => {
      const result = await uut.readByTxid('test')
      // console.log('result: ', result)
      // Assert that expected data is coming back from the p2wdb mock.
      assert.property(result, 'data')
    })
    it('should catch and throw an error', async () => {
      try {
        // Force Error
        sandbox
          .stub(uut.p2wdbAdapter, 'readByTxid')
          .rejects(new Error('test error'))
        await uut.readByTxid()
        assert.fail('Unexpected code path')
      } catch (err) {
        assert.include(err.message, 'test error')
      }
    })
  })
  describe('#readByAppId', () => {
    it('should return P2WDB data', async () => {
      const result = await uut.readByAppId('test')
      // console.log('result: ', result)
      // Assert that expected data is coming back from the p2wdb mock.
      assert.property(result, 'data')
    })
    it('should catch and throw an error', async () => {
      try {
        // Force Error
        sandbox
          .stub(uut.p2wdbAdapter, 'readByAppId')
          .rejects(new Error('test error'))
        await uut.readByAppId()
        assert.fail('Unexpected code path')
      } catch (err) {
        assert.include(err.message, 'test error')
      }
    })
  })
})
