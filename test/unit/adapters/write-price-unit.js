/*
  Unit tests for the write-price.js adapter library
*/

// Global npm libraries
const sinon = require('sinon')
const assert = require('chai').assert

// Local libraries
const WritePrice = require('../../../src/adapters/write-price')
const mockData = require('../mocks/adapters/write-price-mocks')

describe('#write-price', () => {
  let uut, sandbox

  beforeEach(() => {
    uut = new WritePrice()

    sandbox = sinon.createSandbox()
  })

  afterEach(() => sandbox.restore())

  describe('#getWriteCost', () => {
    it('should get latest price for P2WDB writes', async () => {
      // Mock dependencies
      sandbox.stub(uut.wallet,'getTokenData').resolves(mockData.mockTokenData01)
      sandbox.stub(uut.axios,'get').resolves({data: mockData.mutableData01})

      const result = await uut.getWriteCost()
      // console.log('result: ', result)

      assert.equal(result.date.toISOString(), '2022-06-24T07:00:00.000Z')
      assert.equal(result.psfPerWrite, 0.133)
    })

    it('should catch and throw an error', async () => {
      // Force an error
      sandbox.stub(uut.wallet,'getTokenData').rejects(new Error('test error'))

      try {
        await uut.getWriteCost()

        assert.fail('Unexpected result')
      } catch(err) {
        assert.include(err.message, 'test error')
      }
    })
  })
})
