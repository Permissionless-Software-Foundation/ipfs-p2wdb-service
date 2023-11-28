/*
  Unit tests for controllers index.js file.
*/

// Public npm libraries
import { assert } from 'chai'
import sinon from 'sinon'

// Local libraries
import Controllers from '../../../src/controllers/index.js'

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
      // mock IPFS
      sandbox.stub(uut.adapters, 'start').resolves({})
      uut.adapters.ipfs.ipfsCoordAdapter = {
        attachRPCRouter: () => { }
      }

      // Mock the timer controllers
      sandbox.stub(uut.timerControllers, 'startTimers').returns()

      const app = {
        use: () => { }
      }
      await uut.attachControllers(app)
    })

    it('should catch and throw an error', async () => {
      try {
        // Force an error
        // sandbox.stub(uut.adapters, 'start').rejects(new Error('test error'))
        sandbox.stub(uut, 'attachRPCControllers').throws(new Error('test error'))
        const app = {
          use: () => { }
        }
        await uut.attachControllers(app)
        assert.fail('Unexpected code path')
      } catch (err) {
        assert.include(err.message, 'test error')
      }
    })
  })

  describe('#peerEntryAddedEventHandler', () => {
    it('should pass data to the Entry Use-Case', async () => {
      // Mock dependencies
      sandbox.stub(uut.useCases.entry.addEntry, 'addPeerEntry').resolves({})
      await uut.peerEntryAddedEventHandler()
    })

    it('should catch and handle an error', async () => {
      // Force an error
      sandbox
        .stub(uut.useCases.entry.addEntry, 'addPeerEntry')
        .rejects(new Error('test error'))
      await uut.peerEntryAddedEventHandler()
      assert.isOk('Not throwing an error is a success')
    })
  })
})
