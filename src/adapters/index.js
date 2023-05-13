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
    // this.p2wdb = new P2WDB()
    this.entry = new EntryAdapter()
    this.webhook = new WebhookAdapter()
    this.writePrice = new WritePrice()
    this.wallet = new Wallet()
    // Pass the instance of write-price when instantiating the P2WDB OrbitDB.
    localConfig.writePrice = this.writePrice
    // console.log('adapters index.js localConfig: ', localConfig)
    this.p2wdb = new P2WDB(localConfig)
    this.config = config
    // Get a valid JWT API key and instance bch-js.
    this.fullStackJwt = new FullStackJWT(config)
  }

  async start () {
    try {
      if (this.config.getJwtAtStartup) {
        // Get a JWT token and instantiate bch-js with it. Then pass that instance
        // to all the rest of the apps controllers and adapters.
        await this.fullStackJwt.getJWT()
        // Instantiate bch-js with the JWT token, and overwrite the placeholder for bch-js.
        this.bchjs = await this.fullStackJwt.instanceBchjs()
      }
      // Do not start these adapters if this is an e2e test.
      if (this.config.env !== 'test') {
        // Get the write price set by the PSF Minting Council.
        await this.writePrice.instanceWallet()
        const currentRate = await this.writePrice.getMcWritePrice()
        console.log(`Current P2WDB cost is ${currentRate} PSF tokens per write.`)
        // await this.writePrice.getWriteCostInBch()

        // Only execute the code in this block if BCH payments are enabled.
        if (this.config.enableBchPayment) {
          // Retrieve the cost of a write in BCH, if that feature is enabled.
          const bchRate = await this.writePrice.getWriteCostInBch()
          console.log(`BCH payments enabled. Current P2WDB cost is ${bchRate} BCH per write.`)
          // Instance the wallet.
          const walletData = await this.wallet.openWallet()
          await this.wallet.instanceWallet(walletData)
        }

        // Start the IPFS node.
        await this.ipfs.start({ bchjs: this.bchjs })
        // Start the P2WDB
        await this.p2wdb.start({ ipfs: this.ipfs.ipfs, bchjs: this.bchjs })
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
