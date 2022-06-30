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

  describe('#getCostsFromToken', () => {
    it('should retrieve cost history from token mutable data', async () => {
      // Mock dependencies
      sandbox.stub(uut.wallet, 'getTokenData').resolves(mockData.mockTokenData01)
      sandbox.stub(uut.axios, 'get').resolves({ data: mockData.mutableData01 })

      const result = await uut.getCostsFromToken()
      // console.log('result: ', result)

      assert.isArray(result)

      assert.property(result[0], 'date')
      assert.property(result[0], 'psfPerWrite')
    })

    it('should catch and throw an error', async () => {
      try {
        // Force and error
        sandbox.stub(uut.wallet, 'getTokenData').rejects(new Error('test error'))

        await uut.getCostsFromToken()

        assert.fail('Unexpected result')
      } catch (err) {
        assert.include(err.message, 'Could not get P2WDB price from blockchain.')
      }
    })
  })

  describe('#getCurrentCostPSF', () => {
    it('should get the current cost of a write in PSF tokens', () => {
      uut.priceHistory = mockData.mockPriceHistory01

      const result = uut.getCurrentCostPSF()
      // console.log('result: ', result)

      assert.equal(result, 0.133)
    })

    it('should throw an error if priceHistory has not been initialized', () => {
      try {
        uut.getCurrentCostPSF()

        assert.fail('Unexpected result')
      } catch (err) {
        assert.include(err.message, 'No price history found. Run getCostsFromToken() first.')
      }
    })
  })

  describe('#getTargetCostPsf', () => {
    it('should get the current cost of a write in PSF tokens', () => {
      uut.priceHistory = mockData.mockPriceHistory01

      const result = uut.getTargetCostPsf('06/21/2022')
      // console.log('result: ', result)

      assert.equal(result, 0.126)
    })

    it('should throw an error if priceHistory has not been initialized', () => {
      try {
        uut.getTargetCostPsf('06/22/2022')

        assert.fail('Unexpected result')
      } catch (err) {
        assert.include(err.message, 'No price history found. Run getCostsFromToken() first.')
      }
    })

    it('should throw an error if no date target is provided', () => {
      try {
        uut.getTargetCostPsf()

        assert.fail('Unexpected result')
      } catch (err) {
        assert.include(err.message, 'targetDate input is required.')
      }
    })
  })
})
