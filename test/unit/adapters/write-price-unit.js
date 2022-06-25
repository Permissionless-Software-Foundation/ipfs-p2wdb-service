/*
  Unit tests for the write-price.js adapter library
*/

// Global npm libraries
const sinon = require('sinon')
const assert = require('chai').assert
const cloneDeep = require('lodash.clonedeep')

// Local libraries
const WritePrice = require('../../../src/adapters/write-price')
const mockDataLib = require('../mocks/adapters/write-price-mocks')

describe('#write-price', () => {
  let uut, sandbox, mockData

  beforeEach(() => {
    uut = new WritePrice()

    mockData = cloneDeep(mockDataLib)

    sandbox = sinon.createSandbox()
  })

  afterEach(() => sandbox.restore())

  describe('#getWriteCost', () => {
    it('should get latest price for P2WDB writes', async () => {
      // Mock dependencies
      sandbox.stub(uut.wallet, 'getTokenData').resolves(mockData.mockTokenData01)
      sandbox.stub(uut.axios, 'get').resolves({ data: mockData.mutableData01 })

      const result = await uut.getWriteCostPsf()
      // console.log('result: ', result)

      assert.equal(result, 0.133)
    })

    it('should catch and throw an error', async () => {
      // Force an error
      sandbox.stub(uut.wallet, 'getTokenData').rejects(new Error('test error'))

      try {
        await uut.getWriteCostPsf()

        assert.fail('Unexpected result')
      } catch (err) {
        assert.include(err.message, 'test error')
      }
    })

    it('should throw error if rate can not be determined', async () => {
      // Force an error
      sandbox.stub(uut.wallet, 'getTokenData').resolves(mockData.mockTokenData01)
      mockData.mutableData01.p2wdbPriceHistory = []
      sandbox.stub(uut.axios, 'get').resolves({ data: mockData.mutableData01 })

      try {
        await uut.getWriteCostPsf()

        assert.fail('Unexpected result')
      } catch (err) {
        assert.include(err.message, 'Could not retrieve write rate in PSF tokens.')
      }
    })
  })
})
