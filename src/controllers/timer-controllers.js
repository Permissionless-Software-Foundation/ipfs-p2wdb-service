/*
  This Controller library is concerned with timer-based functions that are
  kicked off periodicially.
*/

// Global npm libraries
import RetryQueue from '@chris.troutner/retry-queue'

// Local libraries
import config from '../../config/index.js'

class TimerControllers {
  constructor (localConfig = {}) {
    // Dependency Injection.
    this.adapters = localConfig.adapters
    if (!this.adapters) {
      throw new Error(
        'Instance of Adapters library required when instantiating Timer Controller libraries.'
      )
    }
    this.useCases = localConfig.useCases
    if (!this.useCases) {
      throw new Error(
        'Instance of Use Cases library required when instantiating Timer Controller libraries.'
      )
    }

    this.debugLevel = localConfig.debugLevel

    // Encapsulate dependencies
    this.config = config
    this.retryQueue = new RetryQueue({
      concurrency: 6,
      attempts: 1,
      timeout: 60000
    })

    // Bind 'this' object to all subfunctions.
    this.optimizeWallet = this.optimizeWallet.bind(this)
    this.manageTickets = this.manageTickets.bind(this)
    this.forceSync = this.forceSync.bind(this)
    this.shouldStop = this.shouldStop.bind(this)
    this.manageSync = this.manageSync.bind(this)
    this.pinMngr = this.pinMngr.bind(this)

    // Automatically start the timers when this library is loaded.
    // this.startTimers()

    // state
    // this.forceSyncPeriod = 60000 * 1
    // this.pinMngrPeriod = 60000 * 4
    this.forceSyncPeriod = 60000 * 5
    this.pinMngrPeriod = 60000 * 60
    this.stopSync = false
    this.syncHasStopped = false
    this.waitingToStop = false
    this.firstSyncRun = true
    this.syncManagerTimerHandle = {}
    // this.shouldStartForceSyncInterval = true
    // this.shouldStartSyncMonitorInterval = true
    this.syncStartTime = null
    this.isFullySynced = false // True when DB is fully synced.
  }

  // Start all the time-based controllers.
  startTimers () {
    console.log('this.config.enableBchPayment: ', this.config.enableBchPayment)

    if (this.config.enableBchPayment) {
      this.optimizeWalletHandle = setInterval(this.optimizeWallet, 60000 * 60) // Every 60 minutes
      // this.optimizeWalletHandle = setTimeout(this.optimizeWallet, 60000 * 0.5)
    }

    if (this.config.enablePreBurnTicket) {
      this.manageTicketsHandle = setInterval(this.manageTickets, 60000 * 11) // Every 11 minute
    }

    // Create a timer to force periodic sync of the database across peers.
    this.forceSyncHandle = setInterval(this.forceSync, this.forceSyncPeriod)
    // setTimeout(this.forceSync, 60000) // Start the first sync right away.

    // Any new timer control functions can be added here. They will be started
    // when the server starts.
    // this.optimizeWalletHandle = setInterval(this.exampleTimerFunc, 60000 * 10)

    if (this.config.pinEnabled) {
      this.pinMngrHandle = setInterval(this.pinMngr, this.pinMngrPeriod)

      // Kick off the first pinning after 10 minutes
      setTimeout(this.pinMngr, 60000 * 10)
      // setTimeout(this.pinMngr, 60000 * 5)
    }

    const _this = this
    setInterval(function () {
      const queueSize = _this.retryQueue.validationQueue.size
      console.log(`The pin MANAGER queue contains ${queueSize} promises.`)
    }, 60000)

    return true
  }

  stopTimers () {
    clearInterval(this.optimizeWalletHandle)
    clearInterval(this.manageTicketsHandle)
    clearInterval(this.forceSyncHandle)
    clearInterval(this.syncManagerTimerHandle)
    clearInterval(this.pinMngrHandle)
  }

  // If this node is configured to pin IPFS content, then cycle through all
  // the database entries and look for any that still need to be pinned.
  async pinMngr () {
    try {
      // Only start the pin manager if the database is fully synced.
      if (this.isFullySynced) {
        // Clear the interval while this is executing, so that multiple instances
        // do not execute.
        clearInterval(this.pinMngrHandle)

        const db = this.adapters.p2wdb.orbit.db

        // let cnt = 0

        for await (const record of db.iterator()) {
          // console.log(`${cnt}) pinMngr iterating over db: `, record)
          // cnt++

          // console.log('record.value.data: ', record.value.data)

          const jsonStr = record.value.data
          let data
          try {
            data = JSON.parse(jsonStr)
          } catch (err) {
            console.log('Could not parse this JSON string: ', jsonStr)
            continue
          }

          if (data.appId === 'p2wdb-pin-001') {
            const cid = data.data.cid
            console.log(`Ready to pin this CID: ${cid}`)

            // const pinPromiseCnt = this.useCases.pin.promiseCnt
            // console.log(`Pinning promises: ${pinPromiseCnt}`)

            // await this.useCases.pin.pinCid(cid)

            const queueSize = this.retryQueue.validationQueue.size
            console.log(`The pin MANAGER queue contains ${queueSize} promises.`)

            // Add the pin call to the queue. Do not await, this will load the
            // queue with promises to work through.
            this.retryQueue.addToQueue(this.useCases.pin.pinCidWithTimeout, cid)
            // this.retryQueue.addToQueue(this.useCases.pin.pinCid, cid)
          }
        }

        console.log('Initialized download of all pin requests.')

        // Restart the timer interval
        // this.pinMngrHandle = setInterval(this.pinMngr, this.pinMngrPeriod)

        return true
      }

      return false
    } catch (err) {
      console.error('Error in pinMngr(): ', err)
      // Do not throw error. This is a top-level function.

      return false
    }
  }

  // This function is injected into the db.all() function. It is called each
  // time that function loops through syncing.
  shouldStop () {
    // console.log(`shouldStop() called: stopSync: ${this.stopSync}, syncHasStopped: ${this.syncHasStopped}, waitingToStop: ${this.waitingToStop}`)
    if (this.stopSync) {
      this.syncHasStopped = true
      return true
    }

    return false
  }

  // Force the OrbitDB to sync by iterating over the database entries. If there
  // are missing entries, this action will cause this node to reach out to
  // other peers to try and retrieve the missing entries.
  async forceSync () {
    try {
      // Turn off the timer while syncing is happening.
      clearInterval(this.forceSyncHandle)
      // this.shouldStartForceSyncInterval = false

      console.log('Timer Interval: Syncing P2WDB to peers...')
      // console.log(`forceSync(): stopSync: ${this.stopSync}, syncHasStopped: ${this.syncHasStopped}, waitingToStop: ${this.waitingToStop}`)
      // console.log(`this.shouldStartForceSyncInterval: ${this.shouldStartForceSyncInterval}, this.shouldStartSyncMonitorInterval: ${this.shouldStartSyncMonitorInterval}`)

      this.syncStartTime = new Date()

      // if(this.syncManagerTimerHandle && !this.syncManagerTimerHandle._idleTimeout && !this.syncHasStopped) {
      this.syncManagerTimerHandle = setInterval(this.manageSync, 60000)
      // }

      // console.log('this.syncManagerTimerHandle._idleTimeout: ', this.syncManagerTimerHandle._idleTimeout)

      // console.log('Calling db.all()')
      const db = this.adapters.p2wdb.orbit.db
      const res = await db.all({ shouldStop: this.shouldStop })
      // console.log('db length: ', res.length)

      console.log('...finished syncing database.')

      const now = new Date()
      const syncTookMins = (now.getTime() - this.syncStartTime.getTime()) / 60000
      // console.log(`forceSync() ran for ${syncTookMins} minutes`)

      // If the DB is fully synced, then disable the sync manager
      // The db.all() call will resolve after a few seconds if the DB is fully
      // synced. Otherwise it will take a lot longer, and the sync manager will
      // goad it into syncing.
      if (syncTookMins < 3) {
        console.log('OrbitDB appears synced. Disabling sync manager.')
        clearInterval(this.syncManagerTimerHandle)
        this.isFullySynced = true
      }

      // New peer with an empty database.
      if (res.length === 0 && !this.stopSync && !this.syncHasStopped && !this.waitingToStop) {
        clearInterval(this.syncManagerTimerHandle)
        this.forceSyncHandle = setInterval(this.forceSync, this.forceSyncPeriod)
      }

      return res.length
    } catch (err) {
      // Do not throw an error. This is a top-level function.
      console.error('Error in timer-controllers.js/forceSync(): ', err)

      // Unexpected error, like db.all() is not a function because a new peer
      // hasn't initialized the database.
      if (this.shouldStartForceSyncInterval) {
        clearInterval(this.syncManagerTimerHandle)
        this.forceSyncHandle = setInterval(this.forceSync, this.forceSyncPeriod)
      }

      return false
    }
  }

  // This is a separate timer interval handler that managed sync. When it stalls,
  // it stops and restarts the forceSync timer interval.
  manageSync () {
    try {
      const now = new Date()
      const diff = (now.getTime() - this.syncStartTime.getTime()) / 60000
      console.log(`forceSync() has been running for ${diff} minutes`)

      const lastCanAppendCall = this.adapters.p2wdb.orbit.p2wCanAppend.lastAppendCall
      const appendDiff = (now.getTime() - lastCanAppendCall.getTime()) / 60000
      console.log(`Last CanAppend() call made ${appendDiff} minutes ago.`)

      // const pinPromiseCnt = this.useCases.pin.promiseCnt
      // console.log(`Pinning promises: ${pinPromiseCnt}`)

      console.log(`stopSync: ${this.stopSync}, syncHasStopped: ${this.syncHasStopped}, waitingToStop: ${this.waitingToStop}`)

      if (diff > 5 && appendDiff > 5) {
        // this.forceSyncHandle = setInterval(this.forceSync, this.forceSyncPeriod)

        // if (!this.waitingToStop && !this.syncHasStopped && !this.stopSync && this.firstSyncRun) {
        if (!this.waitingToStop && !this.syncHasStopped && !this.stopSync) {
          // The sync needs to be stopped

          console.log('Signaling sync should stop.')

          this.stopSync = true
          this.syncHasStopped = false
          this.waitingToStop = true
          // this.firstSyncRun = false

          // Renable the timer interval, which will simultaniously stop the sync
          // and attempt to start it again.
          // this.forceSyncHandle = setInterval(this.forceSync, this.forceSyncPeriod)

          clearInterval(this.syncManagerTimerHandle)
          console.log('canceling syncManagerTimerHandle. _idleTimeout: ', this.syncManagerTimerHandle._idleTimeout)

          console.log('Calling forceSync()')
          this.forceSync()

          return 2
        }
      } else if (appendDiff > 5) {
        if (this.waitingToStop && this.syncHasStopped && this.stopSync) {
          // Syncing has stopped and it can be started again.

          console.log('Signaling that sync should resume.')

          // Re-initialize state
          this.stopSync = false
          this.syncHasStopped = false
          this.waitingToStop = false

          clearInterval(this.syncManagerTimerHandle)
          console.log('canceling syncManagerTimerHandle. _idleTimeout: ', this.syncManagerTimerHandle._idleTimeout)

          // Renable the timer interval, which will simultaniously stop the sync
          // and attempt to start it again.
          // this.shouldStartForceSyncInterval = false
          // console.log('Setting shouldStartForceSyncInterval to false')
          this.forceSyncHandle = setInterval(this.forceSync, this.forceSyncPeriod)

          return 3
        }
      }

      return 1
    } catch (err) {
      console.error('Error in manageSync(): ', err)
      // Do not throw error, this is a top-level function

      return false
    }
  }

  // Check the pre-burn ticket queue and generate new tickets if needed.
  async manageTickets () {
    try {
      let now = new Date()
      console.log(`Started manageTickets() timer controller at ${now.toISOString()} UTC}`)

      await this.useCases.ticket.manageTicketQueue()

      now = new Date()
      console.log(`Finished manageTickets() timer controller at ${now.toISOString()} UTC`)

      return true
    } catch (err) {
      // Do not throw an error. This is a top-level function.
      console.error('Error in timer-controllers.js/manageTickets()')
      return false
    }
  }

  // Reduces the number of UTXOs in the wallet, making it more efficient and faster.
  async optimizeWallet () {
    try {
      console.log('optimizeWallet() timer controller fired')
      // console.log('this.useCases: ', this.useCases)
      // const hash = await this.useCases.order.checkOrders()
      await this.adapters.wallet.optimize()

      return true
    } catch (err) {
      // Do not throw an error. This is a top-level function.
      console.log('Error in timer-controllers.js/optimizeWallet(): ', err)
      return false
    }
  }
}
export default TimerControllers
