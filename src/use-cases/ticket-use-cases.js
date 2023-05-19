/*
  This library contains business logic for managing pre-burned tickets.

  This ticket feature is enabled via the config file. If enabled, this feature
  uses index-1 of the HD wallet to manage tickets. This address requires a
  working balance of BCH and PSF tokens, in order to generate tickets.

  This library maintains queue (array) of pre-burned tickets. When one is
  consumed, it will generate a second one.
*/

// Local libraries
import TicketEntity from '../entities/ticket-entity.js'

// Set the maximum number of tickets that are held in the queue.
const MAX_TICKETS = 2

const MIN_SATS = 100000
const MIN_PSF_TOKENS = 1
const TOKEN_ID = '38e97c5d7d3585a2cbf3f9580c82ca33985f9cb0845d4dcce220cb709f9538b0'

class TicketUseCases {
  constructor (localConfig = {}) {
    // console.log('User localConfig: ', localConfig)
    this.adapters = localConfig.adapters
    if (!this.adapters) {
      throw new Error(
        'Instance of adapters must be passed in when instantiating Ticket Use Cases library.'
      )
    }

    // Encapsulate dependencies
    this.TicketEntity = TicketEntity
    this.TicketModel = this.adapters.localdb.Tickets

    // State
    this.state = {

    }
  }

  // Initialize the library and the ticket queue.
  async start () {
    try {
      console.log('Ticket Use Cases have started.')

      // Create a wallet based on the keypair from HD index 1
      const keyPair = await this.adapters.wallet.getKeyPair(1)
      this.wallet = await this.adapters.ticket.instanceTicketWallet(keyPair)
      console.log(`Ticket USE Case this.wallet.walletInfo: ${JSON.stringify(this.wallet.walletInfo, null, 2)}`)

      // Check that the wallet has a balance of BCH.
      const bchBalance = await this.wallet.getBalance()
      console.log(`bchBalance: ${JSON.stringify(bchBalance, null, 2)}`)
      if (bchBalance < MIN_SATS) {
        throw new Error(`Can not start pre-burn ticket feature. Insufficient BCH balance in ticket wallet. Must have at least ${MIN_SATS} satoshis. Send more than ${MIN_SATS} to ${this.wallet.walletInfo.cashAddress}, or disable ticket feature in config, to resolve this error.`)
      }

      // Check that the wallet has a balance of PSF tokens.
      const tokenBalance = await this.wallet.getTokenBalance(TOKEN_ID)
      console.log(`tokenBalance: ${JSON.stringify(tokenBalance, null, 2)}`)
      if (tokenBalance < MIN_PSF_TOKENS) {
        throw new Error(`Can not start pre-burn ticket feature. Insufficient PSF token balance in ticket wallet. Must have at least ${MIN_PSF_TOKENS} PSF tokens. Send more than ${MIN_PSF_TOKENS} PSF tokens to ${this.wallet.walletInfo.slpAddress}, or disable ticket feature in config, to resolve this error.`)
      }

      const ticketCnt = await this.getTicketCount()

      // Create more tickets if there are less than the maximum allowed.
      if (ticketCnt < MAX_TICKETS) {
        const cntDiff = MAX_TICKETS - ticketCnt
        for (let i = 0; i < cntDiff; i++) {
          await this.adapters.ticket.createTicket({ TicketModel: this.TicketModel })
        }
      }
    } catch (err) {
      console.error('Error in ticket-use-cases.js/start()')
      throw err
    }
  }

  // This function returns a number representing the number of tickets
  // in the database.
  async getTicketCount () {
    // Load all tickets from the database.
    const tickets = await this.TicketModel.find({})
    // console.log(`Existing database tickets: ${JSON.stringify(tickets, null, 2)}`)

    return tickets.length
  }
}

export default TicketUseCases

/*
  Dev Notes:
  - CT 5/19/23: Originally I wanted to review the ticket wallet transaction history to
  find tickets on-the-fly, but I can't restore the signature or message from
  the transaction history. That killed that idea. Instead, tickets are created
  and stored in the local Mongo database and managed that way.
*/
