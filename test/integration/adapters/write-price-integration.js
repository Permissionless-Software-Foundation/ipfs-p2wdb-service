/*
  Integration tests for write-price.js adapter library
*/

const WritePrice = require('../../../src/adapters/write-price')

describe('#write-price', () => {
  let uut

  beforeEach(() => {
    uut = new WritePrice()
  })

  describe('#getWriteCost', () => {
    it('should get the write price from the token', async () => {
      const result = await uut.getWriteCost()
      console.log('result: ', result)
    })
  })
})
