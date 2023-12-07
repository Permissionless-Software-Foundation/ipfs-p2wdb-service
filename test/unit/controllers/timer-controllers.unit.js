/*
  Unit tests for the timer-controller.js Controller library
*/

// Public npm libraries
import { assert } from 'chai'
import sinon from 'sinon'

// Local libraries
import TimerControllers from '../../../src/controllers/timer-controllers.js'
import adapters from '../mocks/adapters/index.js'
import UseCasesMock from '../mocks/use-cases/index.js'

describe('#Timer-Controllers', () => {
  let uut
  let sandbox

  beforeEach(() => {
    sandbox = sinon.createSandbox()
    const useCases = new UseCasesMock()
    uut = new TimerControllers({ adapters, useCases })
  })

  afterEach(() => {
    sandbox.restore()
    uut.stopTimers()
  })

  describe('#constructor', () => {
    it('should throw an error if adapters are not passed in', () => {
      try {
        uut = new TimerControllers()

        assert.fail('Unexpected code path')
      } catch (err) {
        assert.include(
          err.message,
          'Instance of Adapters library required when instantiating Timer Controller libraries.'
        )
      }
    })

    it('should throw an error if useCases are not passed in', () => {
      try {
        uut = new TimerControllers({ adapters })

        assert.fail('Unexpected code path')
      } catch (err) {
        assert.include(
          err.message,
          'Instance of Use Cases library required when instantiating Timer Controller libraries.'
        )
      }
    })
  })

  describe('#optimizeWallet', () => {
    it('should kick off the Use Case', async () => {
      // Mock dependencies and force desired code path.
      sandbox.stub(uut.adapters.wallet, 'optimize').resolves()
      const result = await uut.optimizeWallet()
      assert.equal(result, true)
    })

    it('should return false on error', async () => {
      // Mock dependencies and force desired code path.
      sandbox.stub(uut.adapters.wallet, 'optimize').rejects(new Error('test error'))
      const result = await uut.optimizeWallet()
      assert.equal(result, false)
    })
  })

  describe('#manageTickets', () => {
    it('should kick off the Use Case', async () => {
      // Mock dependencies and force desired code path.
      sandbox.stub(uut.useCases.ticket, 'manageTicketQueue').resolves()

      const result = await uut.manageTickets()

      assert.equal(result, true)
    })

    it('should return false on error', async () => {
      // Mock dependencies and force desired code path.
      sandbox.stub(uut.useCases.ticket, 'manageTicketQueue').rejects(new Error('test error'))

      const result = await uut.manageTickets()

      assert.equal(result, false)
    })
  })

  describe('#startTimers', () => {
    it('should start timers', () => {
      const originalState = uut.config.enablePreBurnTicket
      uut.config.enablePreBurnTicket = true

      const result = uut.startTimers()

      uut.stopTimers()

      uut.config.enablePreBurnTicket = originalState

      assert.equal(result, true)
    })
  })

  describe('#manageTickets', () => {
    it('should return the number of entries in the database', async () => {
      // Mock dependencies and force desired code path.
      sandbox.stub(uut.adapters.p2wdb.orbit.db, 'all').resolves([1, 2, 3, 4, 5, 6])

      const result = await uut.forceSync()
      console.log('result: ', result)

      uut.stopTimers()

      assert.equal(result, 6)
    })

    it('should return false on error', async () => {
      // Force error
      sandbox.stub(uut.adapters.p2wdb.orbit.db, 'all').rejects(new Error('test error'))

      const result = await uut.forceSync()
      console.log('result: ', result)

      uut.stopTimers()

      assert.equal(result, false)
    })
  })
})
