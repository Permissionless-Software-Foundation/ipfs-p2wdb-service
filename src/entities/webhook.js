/*
  Webhook Entity
*/

class Webhook {
  validate ({ url, appId } = {}) {
    // Input validation.
    if (!url || typeof url !== 'string') {
      throw new Error('url for webhook must be a string.')
    }
    if (!appId || typeof appId !== 'string') {
      throw new Error('appId for webhook must be a string.')
    }

    const webhookData = { url, appId }

    return webhookData
  }
}

module.exports = Webhook
