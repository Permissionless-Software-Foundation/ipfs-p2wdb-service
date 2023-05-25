/*
  Unit tests for the Ticket entity library.
*/

import chai from 'chai'
import sinon from 'sinon'
import TicketEntity from '../../../src/entities/ticket-entity.js'

const assert = chai.assert
let sandbox
let uut

describe('#Ticket-Entity', () => {
  before(async () => { })

  beforeEach(() => {
    sandbox = sinon.createSandbox()
  })

  afterEach(() => sandbox.restore())

  describe('#constructor', () => {
    it('should throw an error if txid is not a string', () => {
      try {
        uut = new TicketEntity()
      } catch (err) {
        assert.include(err.message, 'txid must be a string')
      }
    })

    it('should throw an error if txid is not 64 characters', () => {
      try {
        uut = new TicketEntity({ txid: 'fake-txid' })
      } catch (err) {
        assert.include(err.message, 'txid must be 64 characters long')
      }
    })

    it('should throw an error if signature is not provided', () => {
      try {
        uut = new TicketEntity({ txid: '0078156640440bd00a6224288fb6b4765f8cfb1405bf52e3ec0dcb8f671e20fa' })
      } catch (err) {
        assert.include(err.message, 'signature must be included')
      }
    })

    it('should throw an error if message is not provided', () => {
      try {
        uut = new TicketEntity({
          txid: '0078156640440bd00a6224288fb6b4765f8cfb1405bf52e3ec0dcb8f671e20fa',
          signature: 'fake-sig'
        })
      } catch (err) {
        assert.include(err.message, 'message must be included')
      }
    })

    it('should create a Ticket entity', () => {
      uut = new TicketEntity({
        txid: '0078156640440bd00a6224288fb6b4765f8cfb1405bf52e3ec0dcb8f671e20fa',
        signature: 'fake-sig',
        message: 'fake-message'
      })
      // console.log('uut: ', uut)

      assert.property(uut, 'txid')
      assert.property(uut, 'signature')
      assert.property(uut, 'message')
    })
  })
})
