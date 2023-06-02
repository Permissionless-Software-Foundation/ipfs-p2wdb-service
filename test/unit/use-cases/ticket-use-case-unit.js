/*
  Unit tests for the Ticket Use Case library.
*/

// Public npm libraries
import { assert } from 'chai'
import sinon from 'sinon'

// Local libraries
import TicketLib from '../../../src/use-cases/ticket-use-cases.js'
import adapters from '../mocks/adapters/index.js'
import ModelMock from '../mocks/model-mock.js'

describe('#TicketUseCases', () => {
  let uut
  let sandbox

  before(async () => {
    // Delete all previous users in the database.
    // await testUtils.deleteAllUsers()
  })

  beforeEach(() => {
    sandbox = sinon.createSandbox()
    uut = new TicketLib({ adapters })
  })

  afterEach(() => sandbox.restore())

  describe('#constructor', () => {
    it('should throw an error if adapters are not passed in', () => {
      try {
        uut = new TicketLib()
        assert.fail('Unexpected code path')
      } catch (err) {
        assert.include(err.message, 'Instance of adapters must be passed in when instantiating Ticket Use Cases library.')
      }
    })
  })

  describe('#getTicketCount', () => {
    it('should return the number of tickets in the database', async () => {
      // Mock dependencies and force desired code path.
      uut.TicketModel = ModelMock

      const result = await uut.getTicketCount()
      // console.log('result: ', result)

      assert.isNumber(result)
    })
  })

  describe('#manageTicketQueue', () => {
    it('should return true after successfully managing the ticket queue', async () => {
      // Mock dependencies and force desired code path.
      uut.wallet = await adapters.ticket.instanceTicketWallet()
      sandbox.stub(uut.adapters.wallet, 'getBalance').resolves(100000)
      sandbox.stub(uut.adapters.wallet, 'getTokenBalance').resolves(100)
      sandbox.stub(uut, 'getTicketCount').resolves(0)
      uut.MAX_TICKETS = 0

      const result = await uut.manageTicketQueue()

      assert.equal(result, true)
    })

    it('should validate any existing tickets', async () => {
      // This test simulates a consumed ticket, and the ability for the
      // function to detect it, delete it, and create a new one.

      // Mock dependencies and force desired code path.
      uut.wallet = await adapters.ticket.instanceTicketWallet()
      sandbox.stub(uut.adapters.wallet, 'getBalance').resolves(100000)
      sandbox.stub(uut.adapters.wallet, 'getTokenBalance').resolves(100)
      sandbox.stub(uut, 'getTicketCount').resolves(1)
      sandbox.stub(uut.TicketModel, 'find').resolves([{ txid: 'fake-txid' }])
      sandbox.stub(uut.readEntry, 'readByTxid').resolves({})
      uut.MAX_TICKETS = 0

      const result = await uut.manageTicketQueue()

      assert.equal(result, true)
    })

    it('should skip any unused tickets', async () => {
      // This test simulates a consumed ticket, and the ability for the
      // function to detect it, delete it, and create a new one.

      // Mock dependencies and force desired code path.
      uut.wallet = await adapters.ticket.instanceTicketWallet()
      sandbox.stub(uut.adapters.wallet, 'getBalance').resolves(100000)
      sandbox.stub(uut.adapters.wallet, 'getTokenBalance').resolves(100)
      sandbox.stub(uut, 'getTicketCount').resolves(1)
      sandbox.stub(uut.TicketModel, 'find').resolves([{ txid: 'fake-txid' }])
      sandbox.stub(uut.readEntry, 'readByTxid').rejects(new Error('not found'))
      uut.MAX_TICKETS = 0

      const result = await uut.manageTicketQueue()

      assert.equal(result, true)
    })

    it('should create new tickets until queue is full', async () => {
      // This test simulates the ability for the function to create new tickets

      // Mock dependencies and force desired code path.
      uut.wallet = await adapters.ticket.instanceTicketWallet()
      sandbox.stub(uut.adapters.wallet, 'getBalance').resolves(100000)
      sandbox.stub(uut.adapters.wallet, 'getTokenBalance').resolves(100)
      sandbox.stub(uut, 'getTicketCount').resolves(0)
      uut.MAX_TICKETS = 1
      sandbox.stub(uut.adapters.ticket, 'createTicket').resolves({})

      const result = await uut.manageTicketQueue()

      assert.equal(result, true)
    })
  })

  describe('#start', () => {
    it('should start the ticket queue', async () => {
      // Mock dependencies and force desired code path.
      sandbox.stub(uut.adapters.wallet, 'getKeyPair').resolves({})
      sandbox.stub(uut, 'getTicketCount').resolves(0)

      const result = await uut.start()
      // console.log('result: ', result)

      assert.equal(result, true)
    })

    it('should catch, report, and throw errors', async () => {
      try {
        // Force an error
        sandbox.stub(uut.adapters.wallet, 'getKeyPair').rejects(new Error('test error'))

        await uut.start()

        assert.fail('Unexpected code path')
      } catch (err) {
        assert.include(err.message, 'test error')
      }
    })

    it('should throw an error if ticket wallet does not have enough BCH', async () => {
      try {
        // Force an error
        sandbox.stub(uut.adapters.wallet, 'getKeyPair').resolves({})
        sandbox.stub(uut.adapters.wallet, 'getBalance').resolves(0)

        await uut.start()

        assert.fail('Unexpected code path')
      } catch (err) {
        assert.include(err.message, 'Insufficient BCH balance in ticket wallet.')
      }
    })

    it('should throw an error if ticket wallet does not have enough PSF tokens', async () => {
      try {
        // Force an error
        sandbox.stub(uut.adapters.wallet, 'getKeyPair').resolves({})
        sandbox.stub(uut.adapters.wallet, 'getTokenBalance').resolves(0)

        await uut.start()

        assert.fail('Unexpected code path')
      } catch (err) {
        assert.include(err.message, 'Insufficient PSF token balance in ticket wallet.')
      }
    })
  })
})
