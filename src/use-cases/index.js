/*
  This is a top-level library that encapsulates all the additional Use Cases.
  The concept of Use Cases comes from Clean Architecture:
  https://troutsblog.com/blog/clean-architecture
*/

// Local libraries
import EntryUseCases from './entry/index.js'
import WebhookUseCases from './webhook/index.js'
import UserUseCases from './user.js'
import TicketUseCases from './ticket-use-cases.js'
import config from '../../config/index.js'
import PinUseCases from './pin-use-cases.js'

class UseCases {
  constructor (localConfig = {}) {
    this.adapters = localConfig.adapters
    if (!this.adapters) {
      throw new Error('Instance of adapters must be passed in when instantiating Use Cases library.')
    }

    // Instantiate the use-case libraries.
    this.entry = new EntryUseCases(localConfig)
    this.webhook = new WebhookUseCases(localConfig)
    this.user = new UserUseCases(localConfig)
    this.ticket = new TicketUseCases(localConfig)
    localConfig.entryUseCases = this.entry
    this.pin = new PinUseCases(localConfig)

    // Encapsulate dependencies
    this.config = config
  }

  // Run any startup Use Cases at the start of the app.
  async start () {
    try {
      // Start the Ticket use case library if it is enabled in the config.
      if (this.config.enablePreBurnTicket && this.config.env !== 'test') {
        // Start the pre-burn ticket feature. Do not await, since we do not
        // want this to block startup of the server.
        this.ticket.start()
      }

      // Inject the pin use cases into the webhook adapter
      this.adapters.webhook.injectUseCases({ pinUseCases: this.pin })

      console.log('Async Use Cases have been started.')

      return true
    } catch (err) {
      console.error('Error in use-cases/index.js/start()')
      // console.log(err)
      throw err
    }
  }
}
export default UseCases
