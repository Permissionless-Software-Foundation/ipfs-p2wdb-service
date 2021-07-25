/*
  Unit tests for the localdb adapter library.
*/

const sinon = require('sinon')
const assert = require('chai').assert

// const PostEntry = require('../../../src/adapters/local-db')

// let uut
let sandbox

describe('#post-entry', () => {
  beforeEach(() => {
    // uut = new PostEntry()

    sandbox = sinon.createSandbox()
  })

  afterEach(() => sandbox.restore())

  describe('#restController', () => {
    it('body should contain hash on success', () => {
      // TODO
      assert.equal(1, 1)
    })

    it('should catch and throw an error', async () => {
      // TODO
      assert.equal(1, 1)
    })
  })
})
