/*
  Integration tests for write-price.js adapter library
*/

// Global npm libraries
const assert = require('chai').assert
const mongoose = require('mongoose')

// Local libraries
process.env.P2W_ENV = 'test'
const config = require('../../../config')
const WritePrice = require('../../../src/adapters/write-price')

describe('#write-price', () => {
  let uut

  before(async () => {
    // Connect to the Mongo Database.
    mongoose.Promise = global.Promise
    mongoose.set('useCreateIndex', true) // Stop deprecation warning.
    console.log(
      `Connecting to MongoDB with this connection string: ${config.database}`
    )
    await mongoose.connect(config.database, {
      useUnifiedTopology: true,
      useNewUrlParser: true
    })
  })

  beforeEach(() => {
    uut = new WritePrice()
  })

  // describe('#getCostsFromToken', () => {
  //   it('should get the write price from the token', async () => {
  //     const result = await uut.getCostsFromToken()
  //     console.log('result: ', result)
  //   })
  // })

  // describe('#getCurrentCostPSF', () => {
  //   it('should get the write price from the token', async () => {
  //     const result = await uut.getCurrentCostPSF()
  //     console.log('result: ', result)
  //   })
  // })

  // describe('#getPsfPriceInBch', () => {
  //   it('should get the price of PSF tokens in BCH', async () => {
  //     const result = await uut.getPsfPriceInBch()
  //     console.log('result: ', result)
  //
  //     assert.isAbove(result, 0)
  //   })
  // })

  // describe('#getWriteCostInBch', () => {
  //   it('should get the price to write to P2WDB in BCH', async () => {
  //     const result = await uut.getWriteCostInBch()
  //     console.log('result: ', result)
  //
  //     // assert.isAbove(result, 0)
  //   })
  // })

  // describe('#getMcWritePrice', () => {
  //   it('should get tx history', async () => {
  //     const writePrice = await uut.getMcWritePrice()
  //     console.log('writePrice: ', writePrice)
  //
  //     assert.isBelow(writePrice, 0.2)
  //   })
  // })

  describe('#getMcWritePrice02', () => {
    it('should get tx history', async () => {
      const writePrice = await uut.getMcWritePrice02()
      console.log('writePrice: ', writePrice)

      assert.isBelow(writePrice, 0.2)
    })
  })
})
