/*
  Unit tests for the write-price.js adapter library.
*/

// Global npm libraries
import sinon from 'sinon'
import { assert } from 'chai'
import cloneDeep from 'lodash.clonedeep'

// Local libraries
import WritePrice from '../../../src/adapters/write-price.js'
import mockDataLib from '../mocks/adapters/write-price-mocks.js'
import Wallet from '../../../src/adapters/wallet.js'

describe('#write-price', () => {
  let uut, sandbox, mockData

  beforeEach(async () => {
    const wallet = new Wallet()
    await wallet.instanceWalletWithoutInitialization()

    uut = new WritePrice()
    await uut.initialize({ wallet })

    mockData = cloneDeep(mockDataLib)
    sandbox = sinon.createSandbox()

    // Replace the database model with this mock.
    uut.WritePriceModel = class WritePriceModel {
      static findOne () { }
      async save () {
        return {}
      }
    }
  })

  afterEach(() => sandbox.restore())

  describe('#initialize', () => {
    it('should return true after instantiating wallet', async () => {
      // Mock dependencies and force desired code path
      const wallet = new Wallet()
      await wallet.instanceWalletWithoutInitialization()

      const result = await uut.initialize({ wallet })

      assert.equal(result, true)
    })
  })

  describe('#updateCurrentRateInBch', () => {
    it('should calculate write cost in BCH', async () => {
      // Mock dependencies
      sandbox.stub(uut, 'getPsfPriceInBch').resolves(0.00075689)
      sandbox.stub(uut.wallet.bchWallet, 'getBalance').resolves()
      sandbox.stub(uut.wallet.bchWallet, 'listTokens').resolves()
      uut.currentRate = 0.08335233

      const result = await uut.getWriteCostInBch()
      console.log('result: ', result)

      // assert.equal(result, 0.00011073)
      assert.isAbove(result, 0.00001000)
    })
  })

  describe('#getWriteCostInBch', () => {
    it('should await if currentRate is false', async () => {
      // Mock dependencies and force desired code path
      uut.currentRateInBch = null
      sandbox.stub(uut, 'updateCurrentRateInBch').resolves()

      const result = await uut.getWriteCostInBch()

      assert.equal(result, null)
    })

    it('should not await if currentRate is false', async () => {
      // Mock dependencies and force desired code path
      uut.currentRateInBch = 0.0001
      sandbox.stub(uut, 'updateCurrentRateInBch').resolves()

      const result = await uut.getWriteCostInBch()

      assert.equal(result, 0.0001)
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

  describe('#getMcWritePrice', () => {
    it('should validate a new approval transaction', async () => {
      // Mock dependencies and force desired code path.
      sandbox.stub(uut.ps009, 'getApprovalTx').resolves(mockData.approvalObj01)
      sandbox.stub(uut.WritePriceModel, 'findOne').resolves(null)
      sandbox.stub(uut.ps009, 'getUpdateTx').resolves(mockData.updateObj01)
      sandbox.stub(uut.ps009, 'getCidData').resolves(mockData.validationData01)
      sandbox.stub(uut.ps009, 'validateApproval').resolves(true)
      const result = await uut.getMcWritePrice()
      // console.log('result: ', result)
      assert.equal(result, 0.08335233)
    })

    it('should retrieve a previously validated approval transaction from the database', async () => {
      // Mock dependencies and force desired code path.
      sandbox.stub(uut.ps009, 'getApprovalTx').resolves(mockData.approvalObj01)
      sandbox.stub(uut.WritePriceModel, 'findOne').resolves({
        writePrice: 0.08335233
      })
      const result = await uut.getMcWritePrice()
      // console.log('result: ', result)
      assert.equal(result, 0.08335233)
    })

    it('should recursivly call itself to find the next approval tx', async () => {
      // Mock dependencies and force desired code path.
      sandbox.stub(uut.ps009, 'getApprovalTx').resolves(mockData.approvalObj01)
      sandbox.stub(uut.WritePriceModel, 'findOne').resolves(null)
      sandbox.stub(uut.ps009, 'getUpdateTx').resolves(mockData.updateObj01)
      sandbox.stub(uut.ps009, 'getCidData').resolves(mockData.validationData01)
      sandbox.stub(uut.ps009, 'validateApproval')
        .onCall(0).resolves(false)
        .onCall(1).resolves(true)
      const result = await uut.getMcWritePrice()
      // console.log('result: ', result)
      assert.equal(result, 0.08335233)
    })

    it('should return safety price if no approval tx can be found', async () => {
      // Mock dependencies and force desired code path.
      sandbox.stub(uut.ps009, 'getApprovalTx').resolves(null)
      const result = await uut.getMcWritePrice()
      // console.log('result: ', result)
      assert.equal(result, 0.08335233)
    })

    it('should throw error and return safety price if wallet is not initialized', async () => {
      // Mock dependencies and force desired code path.
      uut.wallet = undefined
      const result = await uut.getMcWritePrice()
      // console.log('result: ', result)
      assert.equal(result, 0.08335233)
    })
  })
})
