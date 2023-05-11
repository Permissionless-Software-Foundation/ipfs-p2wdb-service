/*
  Adapter library for generating pre-burned tickets.
*/

class TicketAdapter {
  constructor (localConfig = {}) {
    this.wallet = localConfig.wallet
    if (!this.wallet) {
      throw new Error('Instance of minimal-slp-wallet required when instantiating Ticket Adapter library.')
    }
  }
}

module.exports = TicketAdapter
