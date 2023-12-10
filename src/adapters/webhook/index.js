
// Global npm libraries
import axios from 'axios'

// Local libraries
import validationEvent from '../orbit/validation-event.js'
import WebhookModel from '../localdb/models/webhook.js'
import config from '../../../config/index.js'

let _this

class WebhookAdapter {
  constructor (localConfig) {
    // Attach the event handler to the event.
    validationEvent.on('TriggerWebHook', this.webhookEventHandler)

    // Encapsulate dependencies
    this.WebhookModel = WebhookModel
    this.axios = axios
    this.config = config
    this.pinUseCases = null // placeholder

    // Bind 'this' object to all subfunctions
    this.webhookEventHandler = this.webhookEventHandler.bind(this)
    this.triggerWebhook = this.triggerWebhook.bind(this)
    this.addWebhook = this.addWebhook.bind(this)
    this.deleteWebhook = this.deleteWebhook.bind(this)

    // The binding fails when the webhookEventHandler() is triggered by an
    // event. So _this global variable is required.
    _this = this
  }

  // Event handler for the validation-succeeded event.
  // This handler will scan the event data for an 'appId'. If a webhook matching
  // that appId is found, it will trigger a call to the webhooks URL.
  async webhookEventHandler (eventData) {
    try {
      // console.log(
      //   'TriggerWebhook event triggered from withing the webhook.js file. Data: ',
      //   eventData
      // )
      // console.log('TriggerWebhook event triggered from withing the webhook.js file.')

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
      console.log(`webhookEventHandler() jsonData: ${JSON.stringify(jsonData, null, 2)}`)

      const appId = jsonData.appId
      console.log('webhookEventHandler() appId: ', appId)

      // Exit quietly if there is no appId in the JSON data.
      if (!appId) { return }

      // For the 'p2wdb-pin-001' app ID, pin the data.
      if (_this.config.pinEnabled) {
        if (appId.includes('p2wdb-pin-001')) {
          _this.pinUseCases.pinCid(jsonData.data.cid)
        }
      }

      // Get wildecard webhooks
      const wildcardMatches = await _this.WebhookModel.find({ appId: '*' })

      // Get webhooks that match the appId
      let matches = await _this.WebhookModel.find({ appId })

      // Combine the matches
      matches = matches.concat(wildcardMatches)
      console.log('webhookEventHandler() matches: ', matches)

      // Add P2WDB entry data to the webhook data.
      jsonData.txid = eventData.txid
      jsonData.hash = eventData.hash
      if (matches.length > 0) {
        await this.triggerWebhook(matches, jsonData)
      }
    } catch (err) {
      console.error('Error in webhookEventHandler(): ', err)
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

  // This funciton is called during startup to inject the pin use cases into
  // this library.
  injectUseCases (inObj = {}) {
    // console.log('pin use-cases injected into webhook adapter.')
    this.pinUseCases = inObj.pinUseCases
  }
}
export default WebhookAdapter
