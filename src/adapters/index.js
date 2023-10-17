// Public npm libraries
import BCHJS from '@psf/bch-js'

// Local libraries
import IPFSAdapter from './ipfs/index.js'
import LocalDB from './localdb/index.js'
import LogsAPI from './logapi.js'
import Passport from './passport.js'
import Nodemailer from './nodemailer.js'
import JSONFiles from './json-files.js'
import FullStackJWT from './fullstack-jwt.js'
import P2WDB from './p2wdb/index.js'
import EntryAdapter from './entry/index.js'
import WebhookAdapter from './webhook/index.js'
import WritePrice from './write-price.js'
import Wallet from './wallet.js'
import Ticket from './ticket-adapter.js'
import config from '../../config/index.js'

class Adapters {
  constructor (localConfig = {}) {
    // Encapsulate dependencies
    this.ipfs = new IPFSAdapter()
    this.localdb = new LocalDB()
    this.logapi = new LogsAPI()
    this.passport = new Passport()
    this.nodemailer = new Nodemailer()
    this.jsonFiles = new JSONFiles()
    this.bchjs = new BCHJS()
    this.entry = new EntryAdapter()
    this.webhook = new WebhookAdapter()
    this.writePrice = new WritePrice()
    this.wallet = new Wallet()
    this.ticket = new Ticket()

    // Pass the instance of write-price when instantiating the P2WDB OrbitDB.
    localConfig.writePrice = this.writePrice
    this.p2wdb = new P2WDB(localConfig)

    // Get a valid JWT API key and instance bch-js.
    this.config = config
    this.fullStackJwt = new FullStackJWT(config)
  }

  async start () {
    try {
      // Modify adapter library to use MNEMONIC passed in env vars.
      let apiToken
      if (this.config.getJwtAtStartup) {
        // Get a JWT token and instantiate bch-js with it. Then pass that instance
        // to all the rest of the apps controllers and adapters.
        apiToken = await this.fullStackJwt.getJWT()
      }

      // Create a default instance of minimal-slp-wallet without initializing it
      // (without retrieving the wallets UTXOs). This instance will be overwritten
      // if the operator has configured BCH payments.
      console.log('\nCreating default startup wallet. This wallet may be overwritten.')
      await this.wallet.instanceWalletWithoutInitialization({}, { apiToken })
      this.bchjs = this.wallet.bchWallet.bchjs

      // If enbableBchPayment is enabled, override the wallet instance generated
      // from env var mnemonic, with mnemonic from wallet file.
      if (this.config.enableBchPayment) {
        await this.wallet.openWallet({ apiToken })

        // Overwrite bchjs instance with the one from the new wallet.
        this.bchjs = this.wallet.bchWallet.bchjs
      }

      // Do not start these adapters if this is an e2e test.
      if (this.config.env !== 'test') {
        // Get the write price set by the PSF Minting Council.
        await this.writePrice.initialize({ wallet: this.wallet })
        const currentRate = await this.writePrice.getMcWritePrice()
        console.log(`\nCurrent P2WDB cost is ${currentRate} PSF tokens per write.`)
        // await this.writePrice.getWriteCostInBch()

        // Only execute the code in this block if BCH payments are enabled.
        if (this.config.enableBchPayment) {
          // Retrieve the cost of a write in BCH, if that feature is enabled.
          const bchRate = await this.writePrice.getWriteCostInBch()
          console.log(`\nBCH payments enabled. Current P2WDB cost is ${bchRate} BCH per write.`)

          // If ticket feature is enabled, then create a ticket queue.
          if (this.config.enablePreBurnTicket) {
            const ticketKeyPair = await this.wallet.getKeyPair(1)
            console.log('ticketKeyPair: ', ticketKeyPair)
            // this.ticket = new Ticket({ wallet: this.wallet.bchWallet })
          }
        }

        // Start the IPFS node.
        await this.ipfs.start({ bchjs: this.bchjs })

        // Start the P2WDB
        await this.p2wdb.start({ ipfs: this.ipfs.ipfs, wallet: this.wallet })
      }

      console.log('Async Adapters have been started.')
      return true
    } catch (err) {
      console.error('Error in adapters/index.js/start()')
      throw err
    }
  }
}
export default Adapters
