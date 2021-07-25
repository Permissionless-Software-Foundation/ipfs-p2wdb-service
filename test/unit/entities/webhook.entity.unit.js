/*
  Unit tests for the P2WDB Entry entity library.
*/

const assert = require('chai').assert
const sinon = require('sinon')

const Webhook = require('../../../src/entities/webhook')

let sandbox
let uut

describe('#Webhook', () => {
  before(async () => {})

  beforeEach(() => {
    uut = new Webhook()

    sandbox = sinon.createSandbox()
  })

  afterEach(() => sandbox.restore())

  describe('#validate', () => {
    it('should throw an error if url is not provided', () => {
      try {
        uut.validate()
      } catch (err) {
        assert.include(err.message, 'url for webhook must be a string.')
      }
    })

    it('should throw an error if appId is not provided', () => {
      try {
        uut.validate({ url: 'test' })
      } catch (err) {
        assert.include(err.message, 'appId for webhook must be a string.')
      }
    })

    it('should return a Webhook object', () => {
      const inputData = {
        url: 'http://test.com',
        appId: 'someapp'
      }

      const entry = uut.validate(inputData)
      // console.log('entry: ', entry)

      assert.property(entry, 'url')
      assert.equal(entry.url, inputData.url)
    })
  })
})
