/*
  Unit tests for the TicketAdapter class
*/

// Global npm libraries
import { assert } from 'chai'
// import sinon from 'sinon'

// Local libraries
import TicketAdapter from '../../../src/adapters/ticket-adapter.js'
import { MockBchWallet } from '../mocks/adapters/wallet.js'
import WriteMock from '../mocks/p2wdb-mock.js'
import ModelMock from '../mocks/model-mock.js'

describe('TicketAdapter', function () {
  let uut
  // let sandbox

  beforeEach(() => {
    uut = new TicketAdapter()

    // sandbox = sinon.createSandbox()
  })

  describe('_instanceWallet', () => {
    it('should return a wallet instance', async () => {
      // Mock dependencies and force desired code path.
      uut.BchWallet = MockBchWallet

      const wif = 'L2SZrBQxHG3K1vr45aUYPyqgvas9oroA8b9LLWe87eiTMViTVXJn'

      const result = await uut._instanceWallet(wif)
      // console.log('result.walletInfo: ', result.walletInfo)

      // Assert that the returned value is an instance of minimal-slp-wallet.
      assert.property(result, 'walletInfo')
    })
  })

  describe('#instanceTicketWallet', () => {
    it('should throw an error if wif is not included', async () => {
      try {
        await uut.instanceTicketWallet()

        assert.fail('Unexpected code path')
      } catch (err) {
        assert.include(err.message, 'wif is required')
      }
    })

    it('should return a wallet instance, and default to consumer-api', async () => {
      // Mock dependencies and force desired code path.
      uut.BchWallet = MockBchWallet

      const wif = 'L2SZrBQxHG3K1vr45aUYPyqgvas9oroA8b9LLWe87eiTMViTVXJn'

      const result = await uut.instanceTicketWallet({ wif })
      // console.log('result.walletInfo: ', result.walletInfo)

      // Assert that the returned value is an instance of minimal-slp-wallet.
      assert.property(result, 'walletInfo')
    })

    it('should return a wallet instance, and use web 2 infra', async () => {
      // Mock dependencies and force desired code path.
      uut.BchWallet = MockBchWallet
      uut.config.useFullStackCash = true

      const wif = 'L2SZrBQxHG3K1vr45aUYPyqgvas9oroA8b9LLWe87eiTMViTVXJn'

      const result = await uut.instanceTicketWallet({ wif })
      // console.log('result.walletInfo: ', result.walletInfo)

      // Assert that the returned value is an instance of minimal-slp-wallet.
      assert.property(result, 'walletInfo')
    })
  })

  describe('#createTicket', () => {
    it('should throw an error if wallet is not instantiated', async () => {
      try {
        await uut.createTicket()

        assert.fail('Unexpected code path')
      } catch (err) {
        assert.include(err.message, 'Wallet must be instantiated before creating tickets.')
      }
    })

    it('should return a ticket', async () => {
      try {
        // Mock dependencies and force desired code path.
        uut.BchWallet = MockBchWallet
        uut.Write = WriteMock

        const wif = 'L2SZrBQxHG3K1vr45aUYPyqgvas9oroA8b9LLWe87eiTMViTVXJn'

        await uut.instanceTicketWallet({ wif })

        const result = await uut.createTicket({ TicketModel: ModelMock })
        // console.log('result: ', result)

        assert.property(result, 'txid')
        assert.property(result, 'signature')
        assert.property(result, 'message')
        assert.property(result, 'timestamp')
        assert.property(result, 'localTimeStamp')
      } catch (err) {
        console.error(err)
        assert.fail('Unexpected code path')
      }
    })
  })
})
