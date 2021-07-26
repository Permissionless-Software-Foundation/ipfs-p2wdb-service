/*
  Use Case library for the Webhook Entity.
  This library controlls all the verbs/actions/use-cases that can be performed
  on or by the Webhook Entity.
*/

// Individual Use Case libraries
const AddWebhook = require('./add-webhook')
const RemoveWebhook = require('./remove-webhook')

class WebhookUseCases {
  constructor (localConfig = {}) {
    this.adapters = localConfig.adapters
    if (!this.adapters) {
      throw new Error(
        'Instance of adapters must be passed in when instantiating Webhook Use Cases library.'
      )
    }

    this.addWebhook = new AddWebhook({ webhookAdapter: this.adapters.webhook })

    // remove() use-case.
    const removeWebhookUseCase = new RemoveWebhook({
      webhookAdapter: this.adapters.webhook
    })
    this.remove = removeWebhookUseCase.remove
  }
}

module.exports = WebhookUseCases
