import AddWebhook from './add-webhook.js'
import RemoveWebhook from './remove-webhook.js'
class WebhookUseCases {
  constructor (localConfig = {}) {
    this.adapters = localConfig.adapters
    if (!this.adapters) {
      throw new Error('Instance of adapters must be passed in when instantiating Webhook Use Cases library.')
    }
    this.addWebhook = new AddWebhook({ webhookAdapter: this.adapters.webhook })
    // remove() use-case.
    const removeWebhookUseCase = new RemoveWebhook({
      webhookAdapter: this.adapters.webhook
    })
    this.remove = removeWebhookUseCase.remove
  }
}
export default WebhookUseCases
