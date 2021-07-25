/*
  This is a top-level library that encapsulates all the additional Use Cases.
  The concept of Use Cases comes from Clean Architecture:
  https://troutsblog.com/blog/clean-architecture
*/

// Individual Use Case libraries
const EntryUseCases = require('./entry')
const WebhookUseCases = require('./webhook')
const UserUseCases = require('./user')

class UseCases {
  constructor (localConfig = {}) {
    this.adapters = localConfig.adapters
    if (!this.adapters) {
      throw new Error(
        'Instance of adapters must be passed in when instantiating Use Cases library.'
      )
    }

    // Instantiate the use-case libraries.
    this.entry = new EntryUseCases(localConfig)
    this.webhook = new WebhookUseCases(localConfig)
    this.user = new UserUseCases(localConfig)
  }
}

module.exports = UseCases
