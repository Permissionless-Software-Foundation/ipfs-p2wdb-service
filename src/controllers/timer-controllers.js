import config from '../../config/index.js'
class TimerControllers {
  constructor (localConfig = {}) {
    // Dependency Injection.
    this.adapters = localConfig.adapters
    if (!this.adapters) {
      throw new Error('Instance of Adapters library required when instantiating Timer Controller libraries.')
    }
    this.useCases = localConfig.useCases
    if (!this.useCases) {
      throw new Error('Instance of Use Cases library required when instantiating Timer Controller libraries.')
    }
    this.debugLevel = localConfig.debugLevel
    // Encapsulate dependencies
    this.config = config
    // Bind 'this' object to all subfunctions.
    this.optimizeWallet = this.optimizeWallet.bind(this)
    this.startTimers()
  }

  // Start all the time-based controllers.
  startTimers () {
    console.log('this.config.enableBchPayment: ', this.config.enableBchPayment)
    if (this.config.enableBchPayment) {
      this.optimizeWalletHandle = setInterval(this.optimizeWallet, 60000 * 10) // Every 10 minutes
      // this.optimizeWalletHandle = setTimeout(this.optimizeWallet, 60000 * 0.5)
    }
  }

  stopTimers () {
    clearInterval(this.optimizeWalletHandle)
  }

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
