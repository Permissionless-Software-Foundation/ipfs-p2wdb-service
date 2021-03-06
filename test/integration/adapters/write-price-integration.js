/*
  Integration tests for write-price.js adapter library
*/

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

  describe('#getWriteCostPsf', () => {
    it('should get the write price from the token', async () => {
      const result = await uut.getWriteCostPsf()
      console.log('result: ', result)
    })
  })
})
