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
import ReadEntry from './entry/read-entry.js'
import RetryQueue from '@chris.troutner/retry-queue'

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
    this.readEntry = new ReadEntry({ p2wdbAdapter: this.adapters.p2wdb })
    this.retryQueue = new RetryQueue()

    // State
    this.state = {

    }

    // Bind 'this' object to all subfunctions.
    this.start = this.start.bind(this)
    this.getTicketCount = this.getTicketCount.bind(this)
    this.manageTicketQueue = this.manageTicketQueue.bind(this)
  }

  // Initialize the library and the ticket queue.
  async start () {
    try {
      console.log('Ticket Use Cases have started.')

      // Create a wallet based on the keypair from HD index 1
      const keyPair = await this.adapters.wallet.getKeyPair(1)
      // this.wallet = await this.adapters.ticket.instanceTicketWallet(keyPair)
      this.wallet = await this.retryQueue.addToQueue(this.adapters.ticket.instanceTicketWallet, keyPair)
      // console.log(`Ticket USE Case this.wallet.walletInfo: ${JSON.stringify(this.wallet.walletInfo, null, 2)}`)

      await this.manageTicketQueue()

      console.log('Pre-burn ticket feature has finished. The system is now loaded with a cache of pre-burn tickets.')

      return true
    } catch (err) {
      console.error('Error in ticket-use-cases.js/start()')
      throw err
    }
  }

  // Generates new tickets until the queue is full.
  async manageTicketQueue () {
    try {
      // Check that the wallet has a balance of BCH.
      const bchBalance = await this.retryQueue.addToQueue(this.wallet.getBalance, {})
      console.log(`bchBalance: ${JSON.stringify(bchBalance, null, 2)}`)
      if (bchBalance < MIN_SATS) {
        throw new Error(`Can not generate pre-burn tickets. Insufficient BCH balance in ticket wallet. Must have at least ${MIN_SATS} satoshis. Send more than ${MIN_SATS} to ${this.wallet.walletInfo.cashAddress}, or disable ticket feature in config, to resolve this error.`)
      }

      // Check that the wallet has a balance of PSF tokens.
      const tokenBalance = await this.retryQueue.addToQueue(this.wallet.getTokenBalance, { tokenId: TOKEN_ID })
      console.log(`tokenBalance: ${JSON.stringify(tokenBalance, null, 2)}`)
      if (tokenBalance < MIN_PSF_TOKENS) {
        throw new Error(`Can not generate pre-burn tickets. Insufficient PSF token balance in ticket wallet. Must have at least ${MIN_PSF_TOKENS} PSF tokens. Send more than ${MIN_PSF_TOKENS} PSF tokens to ${this.wallet.walletInfo.slpAddress}, or disable ticket feature in config, to resolve this error.`)
      }

      let ticketCnt = await this.getTicketCount()

      // For any existing tickets, check that they are still valid.
      if (ticketCnt) {
        const tickets = await this.TicketModel.find({})
        for (let i = 0; i < tickets.length; i++) {
          const ticket = tickets[i]

          try {
            const result = await this.readEntry.readByTxid(ticket.txid)
            console.log('Ticket result: ', result)

            if (result) {
              console.log(`Ticket ${ticket.txid} has already been consumed. Deleting this ticket from the database.`)

              // The ticket has been consumed, so remove it from the database.
              await this.TicketModel.deleteOne({ txid: ticket.txid })
            }
          } catch (err) {
            // Throwing an error here is a good thing. It means the ticket is
            // unused and still valid.
            continue
          }
        }
      }

      ticketCnt = await this.getTicketCount()

      // Create more tickets if there are less than the maximum allowed.
      if (ticketCnt < MAX_TICKETS) {
        const cntDiff = MAX_TICKETS - ticketCnt
        for (let i = 0; i < cntDiff; i++) {
          await this.adapters.ticket.createTicket({ TicketModel: this.TicketModel })
        }
      }
    } catch (err) {
      console.error('Error in manageTicketQueue()')
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
