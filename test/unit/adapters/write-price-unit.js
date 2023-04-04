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
      sandbox.stub(uut.wallet, 'getBalance').resolves()
      sandbox.stub(uut.wallet, 'listTokens').resolves()

      const result = await uut.getWriteCostInBch()
      // console.log('result: ', result)

      assert.equal(result, 0.00011073)
    })
  })

  describe('#verifyMcData', () => {
    it('should verify legitimate minting council data', () => {
      const result = uut.verifyMcData(mockData.validationData01)
      console.log('result: ', result)
    })

    it('should throw an error if addresses do not match', () => {
      try {
        // Mock data and force desired code path
        mockData.validationData01.multisigAddr = 'bad-addr'

        uut.verifyMcData(mockData.validationData01)

        assert.fail('Unexpected code path')
      } catch (err) {
        assert.include(err.message, 'Write price validation: Calculated multisig address does not match the address from downloaded data.')
      }
    })
  })

  describe('#validateApprovalTx', () => {
    it('should validate a legitimate approval transaction', async () => {
      // Mock dependencies and force desired code path.
      sandbox.stub(uut.wallet, 'getTxData').resolves([mockData.validationTx01])
      sandbox.stub(uut.axios, 'get').resolves({ data: mockData.validationData01 })

      const result = await uut.validateApprovalTx({
        approvalTxDetails: mockData.approvalTx01,
        updateTxid: 'f8ea1fcd4481adfd62c6251c6a4f63f3d5ac3d5fdcc38b350d321d93254df65f'
      })
      // console.log('result: ', result)

      assert.equal(result, 0.08335233)
    })

    it('should throw an error if addresses do not match', async () => {
      try {
        // Mock dependencies and force desired code path.
        mockData.approvalTx01.vin[0].address = 'bad-address'
        sandbox.stub(uut.wallet, 'getTxData').resolves([mockData.validationTx01])
        sandbox.stub(uut.axios, 'get').resolves({ data: mockData.validationData01 })

        await uut.validateApprovalTx({
          approvalTxDetails: mockData.approvalTx01,
          updateTxid: 'f8ea1fcd4481adfd62c6251c6a4f63f3d5ac3d5fdcc38b350d321d93254df65f'
        })

        assert.fail('Unexpected code path')
      } catch (err) {
        assert.include(err.message, 'On-chain Minting Council address of')
      }
    })
  })

  describe('#getMcWritePrice', () => {
    it('should detect, retrieve, and validate approval tx from blockchain', async () => {
      // Mock dependencies and force desired code path.
      sandbox.stub(uut.wallet, 'getTransactions').resolves(
        [{
          height: 780917,
          tx_hash: 'a63f9fbcc901316e6e89f5a8caaad6b2ab268278b29866c6c22088bd3ab93900'
        }])
      uut.WritePriceModel = class WritePriceModel {
        static findOne () {}

        async save () {
          return {}
        }
      }
      sandbox.stub(uut.WritePriceModel, 'findOne').resolves(null)
      sandbox.stub(uut.wallet, 'getTxData').resolves([mockData.approvalTx01])
      sandbox.stub(uut, 'validateApprovalTx').resolves(0.111)

      const result = await uut.getMcWritePrice()

      assert.equal(result, 0.111)
    })

    it('should retrieve previously validated approval tx from database', async () => {
      // Mock dependencies and force desired code path.
      sandbox.stub(uut.wallet, 'getTransactions').resolves(
        [{
          height: 780917,
          tx_hash: 'a63f9fbcc901316e6e89f5a8caaad6b2ab268278b29866c6c22088bd3ab93900'
        }])
      sandbox.stub(uut.WritePriceModel, 'findOne').resolves({
        verified: true,
        writePrice: 0.08335233,
        _id: '642c7f0063a0b2c4f5dc31bc',
        txid: 'a63f9fbcc901316e6e89f5a8caaad6b2ab268278b29866c6c22088bd3ab93900',
        isApprovalTx: true,
        blockHeight: 780917,
        __v: 0
      })

      const result = await uut.getMcWritePrice()

      assert.equal(result, 0.08335233)
    })

    it('should return default value if approval TX can not be found', async () => {
      // Mock dependencies and force desired code path.
      sandbox.stub(uut.wallet, 'getTransactions').resolves(
        [{
          height: 780917,
          tx_hash: 'a63f9fbcc901316e6e89f5a8caaad6b2ab268278b29866c6c22088bd3ab93900'
        }])
      uut.WritePriceModel = class WritePriceModel {
        static findOne () {}

        async save () {
          return {}
        }
      }
      sandbox.stub(uut.WritePriceModel, 'findOne').resolves(null)
      sandbox.stub(uut.wallet, 'getTxData').resolves([mockData.validationTx01])
      // sandbox.stub(uut,'validateApprovalTx').resolves(0.111)

      const result = await uut.getMcWritePrice()

      assert.equal(result, 0.2)
    })

    it('it should save, then skip, normal transactions', async () => {
      // Mock dependencies and force desired code path.
      sandbox.stub(uut.wallet, 'getTransactions').resolves(
        [{
          height: 780917,
          tx_hash: 'a63f9fbcc901316e6e89f5a8caaad6b2ab268278b29866c6c22088bd3ab93900'
        }])
      uut.WritePriceModel = class WritePriceModel {
        static findOne () {}

        async save () {
          return {}
        }
      }
      sandbox.stub(uut.WritePriceModel, 'findOne').resolves(null)
      sandbox.stub(uut.wallet, 'getTxData').resolves([mockData.normalTx01])
      // sandbox.stub(uut,'validateApprovalTx').resolves(0.111)

      const result = await uut.getMcWritePrice()

      assert.equal(result, 0.2)
    })

    it('should catch, report, and throw errors', async () => {
      try {
        // Mock dependencies and force desired code path.
        sandbox.stub(uut.wallet, 'getTransactions').rejects(new Error('test error'))

        await uut.getMcWritePrice()

        assert.fail('Unexpected result')
      } catch (err) {
        assert.include(err.message, 'test error')
      }
    })
  })
})
