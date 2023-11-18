/*
  This Controller library is concerned with timer-based functions that are
  kicked off periodicially.
*/

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

    // Bind 'this' object to all subfunctions.
    this.optimizeWallet = this.optimizeWallet.bind(this)
    this.manageTickets = this.manageTickets.bind(this)
    this.forceSync = this.forceSync.bind(this)

    // Automatically start the timers when this library is loaded.
    // this.startTimers()

    // Constants
    this.forceSyncPeriod = 60000 * 1
  }

  // Start all the time-based controllers.
  startTimers () {
    console.log('this.config.enableBchPayment: ', this.config.enableBchPayment)

    if (this.config.enableBchPayment) {
      this.optimizeWalletHandle = setInterval(this.optimizeWallet, 60000 * 60) // Every 60 minutes
      // this.optimizeWalletHandle = setTimeout(this.optimizeWallet, 60000 * 0.5)
    }

    if (this.config.enablePreBurnTicket && this.config.env !== 'test') {
      this.manageTicketsHandle = setInterval(this.manageTickets, 60000 * 11) // Every 11 minute
    }

    // Create a timer to force periodic sync of the database across peers.
    // this.forceSyncHandle = setInterval(this.forceSync, this.forceSyncPeriod)

    // Any new timer control functions can be added here. They will be started
    // when the server starts.
    // this.optimizeWalletHandle = setInterval(this.exampleTimerFunc, 60000 * 10)

    return true
  }

  stopTimers () {
    clearInterval(this.optimizeWalletHandle)
    clearInterval(this.manageTicketsHandle)
    // clearInterval(this.forceSyncHandle)
  }

  async forceSync () {
    try {
      // Turn off the timer while syncing is happening.
      clearInterval(this.forceSyncHandle)

      const db = this.adapters.p2wdb.orbit.db

      let recordCnt = 0
      console.log('Timer Interval: Syncing P2WDB to peers...')

      // console.log('db: ', db)
      // await db.sync.start()

      // const res = await db.all()
      // console.log('db length: ', res.length)

      for await (const record of db.iterator()) {
        console.log('record: ', record)
        recordCnt++

        try {
          await this.useCases.entry.addEntry.addSyncEntry(record)
        } catch (err) {
          console.log(`Entry ${record.hash} already exists in the database. Skipping.\n`)
          continue
        }
      }
      console.log(`Database has this many records: ${recordCnt}`)

      console.log('...finished syncing database.')

      // const res = await db.all()
      // for await (const record of db.iterator()) {
      //   console.log('record: ', record)
      //   recordCnt++
      // }
      // console.log(`Database has this many records: ${recordCnt}`)
      // console.log('...finished syncing database. Records in database: ', res.length)

      // Renable the timer interval
      this.forceSyncHandle = setInterval(this.forceSync, this.forceSyncPeriod)
    } catch (err) {
      // Do not throw an error. This is a top-level function.
      console.error('Error in timer-controllers.js/forceSync(): ', err)

      // Renable the timer interval
      this.forceSyncHandle = setInterval(this.forceSync, this.forceSyncPeriod)

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
