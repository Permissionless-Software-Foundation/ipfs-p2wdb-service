/*
  Integration tests for the modified OrbitDB Access Controller used by the P2WDB.
*/

const assert = require('chai').assert

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
      // console.log('result: ', result)

      assert.equal(result, true)
    })
  })

  describe('#_validateSignature', () => {
    it('should validate a signature', async () => {
      const txid =
        '52009d3036dbf83a3ed9672f2f4fa8b8c0540f6d99d72ea4185449ad703ecf45'
      const signature =
        'IHyqu54fklfMODpuTPl9TJPRU8ktVVkyKfREhRdCq0yUWPnxH78dHGyBQcHNfO8sGzNgsmUEF6qxpo0eVj6f8Vg='
      const message = 'test'

      const result = await uut._validateSignature(txid, signature, message)
      // console.log('result: ', result)

      assert.equal(result, true)
    })

    // it('should handle networking issues', async () => {
    //   // Force network issue
    //   uut.wallet.ar.bchConsumer.restURL = 'http://badurl.cash/'
    //
    //   const txid =
    //     '52009d3036dbf83a3ed9672f2f4fa8b8c0540f6d99d72ea4185449ad703ecf45'
    //   const signature =
    //     'IHyqu54fklfMODpuTPl9TJPRU8ktVVkyKfREhRdCq0yUWPnxH78dHGyBQcHNfO8sGzNgsmUEF6qxpo0eVj6f8Vg='
    //   const message = 'test'
    //
    //   const result = await uut._validateSignature(txid, signature, message)
    //   console.log('result: ', result)
    // })
  })
})
