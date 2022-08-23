/*
  Integration tests for write-price.js adapter library
*/

const assert = require('chai').assert

const WritePrice = require('../../../src/adapters/write-price')

describe('#write-price', () => {
  let uut

  beforeEach(() => {
    uut = new WritePrice()
  })

  describe('#getCostsFromToken', () => {
    it('should get the write price from the token', async () => {
      const result = await uut.getCostsFromToken()
      console.log('result: ', result)
    })
  })

  // describe('#getCurrentCostPSF', () => {
  //   it('should get the write price from the token', async () => {
  //     const result = await uut.getCurrentCostPSF()
  //     console.log('result: ', result)
  //   })
  // })

  describe('#getPsfPriceInBch', () => {
    it('should get the price of PSF tokens in BCH', async () => {
      const result = await uut.getPsfPriceInBch()
      console.log('result: ', result)

      assert.isAbove(result, 0)
    })
  })

  describe('#getWriteCostInBch', () => {
    it('should get the price to write to P2WDB in BCH', async () => {
      const result = await uut.getWriteCostInBch()
      console.log('result: ', result)

      // assert.isAbove(result, 0)
    })
  })
})
