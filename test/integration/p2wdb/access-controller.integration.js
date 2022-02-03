/*
  Integration tests for the modified OrbitDB Access Controller used by the P2WDB.
*/

const PayToWriteAccessController = require('../../../src/adapters/orbit/pay-to-write-access-controller')

describe('#access-controller', () => {
  let uut

  beforeEach(() => {
    uut = new PayToWriteAccessController()
  })

  describe('#_validateTx', () => {
    it('should validate tx burn', async () => {
      const txid =
        '682d7230f251a694ab25db36afdccdc7ea9606a185962848c0456c6b0be47de9'

      const result = await uut._validateTx(txid)
      console.log('result: ', result)
    })
  })
})
