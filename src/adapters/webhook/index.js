
// Global npm libraries
import axios from 'axios'

// Local libraries
import validationEvent from '../orbit/validation-event.js'
import WebhookModel from '../localdb/models/webhook.js'

let _this

class WebhookAdapter {
  constructor (localConfig) {
    // Attach the event handler to the event.
    validationEvent.on('ValidationSucceeded', this.validationSucceededEventHandler)

    // Encapsulate dependencies
    this.WebhookModel = WebhookModel
    this.axios = axios

    _this = this
  }

  // Event handler for the validation-succeeded event.
  // This handler will scan the event data for an 'appId'. If a webhook matching
  // that appId is found, it will trigger a call to the webhooks URL.
  async validationSucceededEventHandler (eventData) {
    try {
      // console.log(
      //   'ValidationSucceeded event triggered from withing the webhook.js file. Data: ',
      //   eventData
      // )
      console.log('ValidationSucceeded event triggered from withing the webhook.js file.')
      
      // const { txid, signature, message, data, hash } = eventData
      const { data } = eventData
      // console.log('data: ', data)
      
      // Attempt to parse the raw data as JSON
      let jsonData = {}
      try {
        jsonData = JSON.parse(data)
      } catch (err) {
        console.log(err.message)
        // Exit quietly. Entry does not comply with webhook protocol.
        return
      }
      console.log(`jsonData: ${JSON.stringify(jsonData, null, 2)}`)
      
      const appId = jsonData.appId
      console.log('appId: ', appId)

      // Exit quietly if there is no appId in the JSON data.
      if (!appId) { return }
      
      let matches
      if(appId === "*") {
        // If webhook is subscribed to all entries.
        matches = await _this.WebhookModel.find({})
      } else {
        matches = await _this.WebhookModel.find({ appId })
      }
      console.log('matches: ', matches)

      // Add P2WDB entry data to the webhook data.
      jsonData.txid = eventData.txid
      jsonData.hash = eventData.hash
      if (matches.length > 0) {
        await _this.triggerWebhook(matches, jsonData)
      }
    } catch (err) {
      console.error('Error in validationSucceededEventHandler(): ', err)
      // Do not throw error. This is a top-level function.
    }
  }

  // This function expects an array of Webhook MongoDB model instances as input.
  // It loops through each match and executes that webhook.
  async triggerWebhook (matches, data) {
    console.log('triggerWebhook() triggered with these matches: ', matches)

    for (let i = 0; i < matches.length; i++) {
      const thisMatch = matches[i]
      console.log(`Webhook triggered. appId: ${thisMatch.appId}, Calling: ${thisMatch.url}`)

      try {
        // Call the webhook.
        await this.axios.post(thisMatch.url, data)
      } catch (err) {
        /* exit quietly */
      }
    }

    return true
  }

  // Add a new Webhook entity to the local database.
  async addWebhook (webhookData) {
    const newWebhook = new this.WebhookModel(webhookData)
    await newWebhook.save()
    // console.log('newWebhook: ', newWebhook)
    const id = newWebhook._id
    return id
  }

  // Delete an existing webhook from the local database.
  // Returns true on success, false if webhook can't be found.
  async deleteWebhook (webhookData) {
    try {
      const matches = await this.WebhookModel.find({
        url: webhookData.url,
        appId: webhookData.appId
      })
      // Return false if there are no matches.
      if (!matches.length) { return false }
      // console.log(`total matches: ${matches.length}`)
      for (let i = 0; i < matches.length; i++) {
        const thisMatch = matches[i]
        await thisMatch.remove()
      }
      return true
    } catch (err) {
      console.error('Error in deleteWebhook: ', err)
      throw err
    }
  }
}
export default WebhookAdapter
