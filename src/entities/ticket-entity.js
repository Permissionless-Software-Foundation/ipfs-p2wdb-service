/*
  A pre-burned ticket or 'ticket' is a TXID representing a proof-of-burn.
*/

class Ticket {
  constructor (inObj = {}) {
    const { txid, signature, message } = inObj

    if (txid.length !== 64) {
      throw new Error('txid must be 64 characters long')
    }
    this.txid = txid

    if (!signature) {
      throw new Error('signature must be included')
    }
    this.signature = signature

    if (!message) {
      throw new Error('message must be included')
    }
    this.message = message
  }
}

// module.exports = Ticket
export default Ticket
