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

  beforeEach(async () => {
    uut = new WritePrice()
    await uut.instanceWallet()

    mockData = cloneDeep(mockDataLib)

    sandbox = sinon.createSandbox()
  })

  afterEach(() => sandbox.restore())

  describe('#instanceWallet', () => {
    it('should return false if wallet is already instantiated', async () => {
      // Mock dependencies and force desired code path
      uut.wallet = true

      const result = await uut.instanceWallet()

      assert.equal(result, false)
    })

    it('should return true after instantiating wallet', async () => {
      // Mock dependencies and force desired code path
      uut.wallet = false
      uut.WalletAdapter = class WalletAdapter {
        async openWallet () { return true }
        async instanceWalletWithoutInitialization () { return true }
      }

      const result = await uut.instanceWallet()

      assert.equal(result, true)
    })
  })

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
        assert.include(err.message, 'Could not get P2WDB price from blockchain:')
      }
    })

    it('should handle error retrieving data from Filecoin', async () => {
      try {
        // Mock dependencies
        sandbox.stub(uut.wallet, 'getTokenData').resolves(mockData.mockTokenData01)
        sandbox.stub(uut.axios, 'get').rejects(new Error('test error'))

        await uut.getCostsFromToken()

        assert.fail('Unexpected result')
      } catch (err) {
        assert.include(err.message, 'Could not retrieve price data from Filecoin.')
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

  describe('#getPsfPriceInBch', () => {
    it('should get the price of PSF tokens in BCH', async () => {
      // Mock network calls
      sandbox.stub(uut.axios, 'get').resolves({
        data: {
          usdPerBCH: 132.02,
          bchBalance: 18.42684558,
          tokenBalance: 47862.62842697,
          usdPerToken: 0.09992589
        }
      })

      const result = await uut.getPsfPriceInBch()
      // console.log('result: ', result)

      assert.equal(result, 0.00075689)
    })

    it('should catch and throw an error', async () => {
      try {
        // Force and error
        sandbox.stub(uut.axios, 'get').rejects(new Error('test error'))

        await uut.getPsfPriceInBch()

        assert.fail('Unexpected result')
      } catch (err) {
        assert.include(err.message, 'test error')
      }
    })
  })

  describe('#getWriteCostInBch', () => {
    it('should get write cost in BCH', async () => {
      // Mock dependencies
      sandbox.stub(uut, 'getPsfPriceInBch').resolves(0.00075689)

      const result = await uut.getWriteCostInBch()
      // console.log('result: ', result)

      assert.equal(result, 0.00011073)
    })
  })
})
