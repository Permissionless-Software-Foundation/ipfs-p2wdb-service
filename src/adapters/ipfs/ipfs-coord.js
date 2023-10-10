// Public npm libraries
// import IpfsCoord from 'ipfs-coord-esm'
import IpfsCoord from 'helia-coord'
import publicIp from 'public-ip'
import SlpWallet from 'minimal-slp-wallet'

// Local libraries
import config from '../../../config/index.js'

// const JSONRPC = require('../../controllers/json-rpc/')
let _this

class IpfsCoordAdapter {
  constructor (localConfig = {}) {
    // Dependency injection.
    this.ipfs = localConfig.ipfs
    if (!this.ipfs) {
      throw new Error('Instance of IPFS must be passed when instantiating ipfs-coord.')
    }
    this.bchjs = localConfig.bchjs
    if (!this.bchjs) {
      throw new Error('Instance of bch-js must be passed when instantiating ipfs-coord.')
    }

    // Encapsulate dependencies
    this.IpfsCoord = IpfsCoord
    this.ipfsCoord = {}
    this.config = config
    this.publicIp = publicIp
    this.wallet = new SlpWallet()

    // Properties of this class instance.
    this.isReady = false

    _this = this
  }

  async start () {
    const circuitRelayInfo = {}
    // If configured as a Circuit Relay, get the public IP addresses for this node.
    if (this.config.isCircuitRelay) {
      try {
        const ip4 = await this.publicIp.v4()
        // const ip6 = await publicIp.v6()
        circuitRelayInfo.ip4 = ip4
        circuitRelayInfo.tcpPort = this.config.ipfsTcpPort
        // Domain used by browser-based secure websocket connections.
        circuitRelayInfo.crDomain = this.config.crDomain
      } catch (err) {
        /* exit quietly */
      }
    }

    await this.wallet.walletInfoPromise

    const ipfsCoordOptions = {
      ipfs: this.ipfs,
      type: 'node.js',
      // type: 'browser',
      // bchjs: this.bchjs,
      wallet: this.wallet,
      privateLog: console.log,
      isCircuitRelay: this.config.isCircuitRelay,
      circuitRelayInfo,
      apiInfo: this.config.apiInfo,
      announceJsonLd: this.config.announceJsonLd,
      debugLevel: this.config.debugLevel
    }

    // Production env uses external go-ipfs node.
    // if (this.config.isProduction) {
    //   ipfsCoordOptions.nodeType = 'external'
    // }

    this.ipfsCoord = new this.IpfsCoord(ipfsCoordOptions)
    // console.log('ipfsCoord: ', this.ipfsCoord)

    // Wait for the ipfs-coord library to signal that it is ready.
    await this.ipfsCoord.start()

    // Signal that this adapter is ready.
    this.isReady = true

    return this.isReady
  }

  // Expects router to be a function, which handles the input data from the
  // pubsub channel. It's expected to be capable of routing JSON RPC commands.
  attachRPCRouter (router) {
    try {
      _this.ipfsCoord.privateLog = router
      _this.ipfsCoord.adapters.pubsub.privateLog = router
    } catch (err) {
      console.error('Error in attachRPCRouter()')
      throw err
    }
  }

  // Subscribe to the chat pubsub channel
  async subscribeToChat () {
    await this.ipfsCoord.adapters.pubsub.subscribeToPubsubChannel(this.config.chatPubSubChan, console.log, this.ipfsCoord.thisNode)
  }
}
export default IpfsCoordAdapter
