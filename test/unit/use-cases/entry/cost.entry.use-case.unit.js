/*
  Unit tests for the P2WDB Cost Use Cases
*/

const assert = require('chai').assert
const sinon = require('sinon')

const Cost = require('../../../../src/use-cases/entry/cost')

// Mocks
const adaptersMock = require('../../mocks/adapters')

let sandbox
let uut

describe('#Cost', () => {
  before(async () => {})

  beforeEach(() => {
    uut = new Cost({
      adapters: adaptersMock
    })

    sandbox = sinon.createSandbox()
  })

  afterEach(() => sandbox.restore())

  describe('#constructor', () => {
    it('should throw an error if adapters instance is not included', () => {
      try {
        uut = new Cost()

        assert.fail('Unexpected code path')
      } catch (err) {
        assert.include(
          err.message,
          'Instance of adapters must be passed in when instantiating Cost Use Cases library.'
        )
      }
    })
  })

  describe('#getPsfCost', () => {
    it('should get the current write cost in PSF tokens', () => {
      const result = uut.getPsfCost()
      // console.log('result: ', result)

      assert.equal(result, 0.133)
    })
  })

  describe('#getPsfCostTarget', () => {
    it('should get the write value for a target date', async () => {
      const targetDate = '06/21/2022'

      const result = await uut.getPsfCostTarget(targetDate)

      assert.equal(result, 0.133)
    })
  })

  describe('#getBchCost', () => {
    it('should generate a new DB model and return an address and cost', async () => {
      // Mock dependencies
      sandbox.stub(uut.adapters.writePrice, 'getWriteCostInBch').resolves(0.0001)
      sandbox.stub(uut.adapters.wallet, 'getKeyPair').resolves({
        cashAddress: 'testAddr',
        hdIndex: 2
      })

      const result = await uut.getBchCost()
      // console.log('result: ', result)

      assert.equal(result.bchCost, 0.0001)
      assert.equal(result.address, 'testAddr')
    })
  })
})
