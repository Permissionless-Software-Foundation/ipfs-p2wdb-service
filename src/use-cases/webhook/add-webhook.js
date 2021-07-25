/*
  This is the Class Library for the add-webhook use-case. This is when a user
  wants to add a new webhook to the system.
*/

const WebhookEntity = require('../../entities/webhook')

let _this

class AddWebhook {
  constructor (localConfig = {}) {
    if (!localConfig.webhookAdapter) {
      throw new Error(
        'webhookAdapter instance must be included when instantiating AddWebhook'
      )
    }
    this.webhookAdapter = localConfig.webhookAdapter

    // Encapsulate dependencies.
    this.webhookEntity = new WebhookEntity()

    _this = this
  }

  // Add a new webhook entry to the local database.
  async addNewWebhook (rawData) {
    try {
      // Generate a validated entry by passing the raw data through input validation.
      const webhookData = _this.webhookEntity.validate(rawData)

      // Throw an error if the entry already exists.
      // const exists = await _this.localdb.doesEntryExist(entry)
      // if (exists) {
      //   throw new Error('Entry already exists in the database.')
      // }

      // Add the webhook entry to the local database.
      const id = await _this.webhookAdapter.addWebhook(webhookData)

      return id
    } catch (err) {
      console.error('Error in addNewWebhook()')
      throw err
    }
  }
}

module.exports = AddWebhook
