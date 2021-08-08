/*
  Unit tests for controllers index.js file.
*/

// Public npm libraries
const assert = require('chai').assert
const sinon = require('sinon')

const Controllers = require('../../../src/controllers')

describe('#Controllers', () => {
  let uut
  let sandbox

  beforeEach(() => {
    sandbox = sinon.createSandbox()

    uut = new Controllers()
  })

  afterEach(() => sandbox.restore())

  describe('#attachControllers', () => {
    it('should attach the controllers', async () => {
<<<<<<< HEAD
      // mock dependencies
      sandbox.stub(uut.adapters.fullStackJwt, 'getJWT').resolves({})
      sandbox.stub(uut.adapters.fullStackJwt, 'instanceBchjs').resolves({})
      sandbox.stub(uut.adapters.ipfs, 'start').resolves({})
      sandbox.stub(uut.adapters.p2wdb, 'start').resolves({})
      // sandbox.stub(uut, 'attachValidationController').resolves({})
      adapters.ipfs.ipfsCoordAdapter = {
=======
      // mock IPFS
      sandbox.stub(uut.adapters, 'start').resolves({})
      uut.adapters.ipfs.ipfsCoordAdapter = {
>>>>>>> 60e6a8b24f7fc264cbb4a5e2dd60d85b6e1c2dd5
        attachRPCRouter: () => {}
      }

      const app = {
        use: () => {}
      }

      await uut.attachControllers(app)
    })

    it('should catch and throw an error', async () => {
      try {
        // Skip getting a JWT token.
        sandbox.stub(uut.adapters.fullStackJwt, 'getJWT').resolves({})
        sandbox.stub(uut.adapters.fullStackJwt, 'instanceBchjs').resolves({})

        // Force an error
        sandbox
          .stub(uut, 'attachRESTControllers')
          .throws(new Error('test error'))

        const app = {
          use: () => {}
        }

        await uut.attachControllers(app)

        assert.fail('Unexpected code path')
      } catch (err) {
        assert.include(err.message, 'test error')
      }
    })
  })

  describe('#validationSucceededEventHandler', () => {
    it('should pass data to the Entry Use-Case', async () => {
      // Mock dependencies
      sandbox.stub(uut.useCases.entry.addEntry, 'addPeerEntry').resolves({})

      await uut.validationSucceededEventHandler()
    })

    it('should catch and handle an error', async () => {
      // Force an error
      sandbox
        .stub(uut.useCases.entry.addEntry, 'addPeerEntry')
        .rejects(new Error('test error'))

      await uut.validationSucceededEventHandler()

      assert.isOk('Not throwing an error is a success')
    })
  })
})
