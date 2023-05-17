import WebhookEntity from '../../entities/webhook.js'
let _this
class RemoveWebhook {
  constructor (localConfig = {}) {
    if (!localConfig.webhookAdapter) {
      throw new Error('webhookAdapter instance must be included when instantiating RemoveWebhook')
    }
    this.webhookAdapter = localConfig.webhookAdapter
    // Encapsulate dependencies.
    this.webhookEntity = new WebhookEntity()
    _this = this
  }

  // Add a new webhook entry to the local database.
  async remove (rawData) {
    try {
      // Generate a validated webhook by passing the raw data through input validation.
      const webhookData = _this.webhookEntity.validate(rawData)
      // Add the webhook entry to the local database.
      const id = await _this.webhookAdapter.deleteWebhook(webhookData)
      return id
    } catch (err) {
      console.error('Error in webhook use-case remove()')
      throw err
    }
  }
}
export default RemoveWebhook
