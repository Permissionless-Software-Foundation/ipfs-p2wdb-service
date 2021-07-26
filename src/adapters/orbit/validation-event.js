/*
  An event emitter that is triggered when a new entry passes the validation
  of the canAppend() function.

  This event emitter is triggered by the canAppend() function in the OrbitDB
  ACL. Multiple functions can then be triggered by the event, like adding
  the new entry to the local MongoDB and triggering a webhook.
*/

const events = require('events')

const em = new events.EventEmitter()

module.exports = em
