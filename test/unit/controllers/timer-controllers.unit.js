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

  describe('#forceSync', () => {
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

    it('new databases should disable sync manager', async () => {
      // Mock dependencies and force desired code path.
      sandbox.stub(uut.adapters.p2wdb.orbit.db, 'all').resolves([])
      uut.stopSync = false
      uut.syncHasStopped = false
      uut.waitingToStop = false

      const result = await uut.forceSync()
      // console.log('result: ', result)

      uut.stopTimers()

      assert.equal(result, 0)
    })

    it('should restart forceSync timer if DB manifest has not been downloaded', async () => {
      // Force error
      sandbox.stub(uut.adapters.p2wdb.orbit.db, 'all').rejects(new Error('test error'))
      uut.shouldStartForceSyncInterval = true

      const result = await uut.forceSync()
      console.log('result: ', result)

      uut.stopTimers()

      assert.equal(result, false)
    })
  })

  describe('#shouldStop', () => {
    it('should return false by default', () => {
      const result = uut.shouldStop()

      assert.equal(result, false)
    })

    it('should return true if stopSync flag is true', () => {
      uut.stopSync = true

      const result = uut.shouldStop()

      assert.equal(result, true)
    })
  })

  describe('#manageSync', () => {
    it('default behavior: should exit without making changes', () => {
      // Mock dependencies and force desired code path
      uut.syncStartTime = new Date()
      uut.adapters.p2wdb.orbit.p2wCanAppend.lastAppendCall = new Date()

      const result = uut.manageSync()

      assert.equal(result, 1)
    })

    it('should run forceSync() if syncing has stalled', () => {
      // Setup test
      const tenMinutes = 60000 * 10
      const now = new Date()
      const tenMinutesAgo = new Date(now.getTime() - tenMinutes)

      // Mock dependencies and force desired code path
      uut.syncStartTime = tenMinutesAgo
      uut.adapters.p2wdb.orbit.p2wCanAppend.lastAppendCall = tenMinutesAgo
      sandbox.stub(uut, 'forceSync').resolves()

      const result = uut.manageSync()

      // Assert expected return value.
      assert.equal(result, 2)

      // Assert expected state
      assert.equal(uut.stopSync, true)
      assert.equal(uut.syncHasStopped, false)
      assert.equal(uut.waitingToStop, true)
    })

    it('should renable forceSync() timer interval if previous sync attempt has stopped', () => {
      // Setup test
      const tenMinutes = 60000 * 10
      const now = new Date()
      const tenMinutesAgo = new Date(now.getTime() - tenMinutes)
      uut.waitingToStop = true
      uut.stopSync = true
      uut.syncHasStopped = true

      // Mock dependencies and force desired code path
      uut.syncStartTime = new Date()
      uut.adapters.p2wdb.orbit.p2wCanAppend.lastAppendCall = tenMinutesAgo

      const result = uut.manageSync()

      // Assert expected return value.
      assert.equal(result, 3)

      // Assert expected state
      assert.equal(uut.stopSync, false)
      assert.equal(uut.syncHasStopped, false)
      assert.equal(uut.waitingToStop, false)
    })

    it('should report errors and return false', () => {
      const result = uut.manageSync()

      assert.equal(result, false)
    })
  })

  describe('#pinMngr', () => {
    it('should return false if database is not synced', async () => {
      const result = await uut.pinMngr()

      assert.equal(result, false)
    })

    it('should pin content via retry-queue', async () => {
      // Mock the OrbitDB iterator() function.
      const mockAsyncGenerator = {
        [Symbol.asyncIterator]: () => {
          const nextStub = sinon.stub()
          nextStub.onFirstCall().returns(Promise.resolve({ value: { value: { data: '{"appId":"p2wdb-pin-001","data":{"cid":"bafybeifr3jzmkh3vikhwa4qwzl4udbnv624uo46i2sgx42c6qeiuuzs6oq"},"timestamp":"2023-02-06T04:58:58.358Z","localTimeStamp":"2/6/2023, 4:58:58 AM"}' } }, done: false }))
          nextStub.onSecondCall().returns(Promise.resolve({ value: { value: { data: 'mocked value 2' } }, done: false }))
          nextStub.onThirdCall().returns(Promise.resolve({ done: true }))

          return {
            next: nextStub,
            return: sinon.stub().returns(Promise.resolve({ done: true })),
            throw: sinon.stub().returns(Promise.reject(new Error('mocked error')))
          }
        }
      }

      // Mock dependencies and force desired code path
      uut.isFullySynced = true
      sandbox.stub(uut.adapters.p2wdb.orbit.db, 'iterator').returns(mockAsyncGenerator)
      sandbox.stub(uut.useCases.pin, 'pinCidWithTimeout').resolves()

      const result = await uut.pinMngr()

      assert.equal(result, true)
    })

    it('should catch and report errors, and return false', async () => {
      // Mock dependencies and force desired code path
      uut.isFullySynced = true
      sandbox.stub(uut.adapters.p2wdb.orbit.db, 'iterator').throws(new Error('test error'))

      const result = await uut.pinMngr()

      assert.equal(result, false)
    })
  })
})
