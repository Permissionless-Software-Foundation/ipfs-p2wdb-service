/*
  Unit tests for the Webhook Use Case index.js library.
*/

const assert = require('chai').assert
const sinon = require('sinon')

const WebhookUseCases = require('../../../../src/use-cases/webhook/')

// Mocks
const adaptersMock = require('../../mocks/adapters')

describe('#WebhookUseCases', () => {
  let uut
  let sandbox

  beforeEach(() => {
    uut = new WebhookUseCases({
      adapters: adaptersMock
    })

    sandbox = sinon.createSandbox()
  })

  afterEach(() => sandbox.restore())

  describe('#constructor', () => {
    it('should throw an error if webhook adapter is not included', () => {
      try {
        uut = new WebhookUseCases()

        assert.fail('Unexpected code path')
        console.log(uut)
      } catch (err) {
        assert.include(
          err.message,
          'Instance of adapters must be passed in when instantiating Webhook Use Cases library.'
        )
      }
    })
  })
})
