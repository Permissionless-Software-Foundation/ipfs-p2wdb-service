/*
  Clean Architecture Adapter for ipfs-coord.
  This library deals with ipfs-coord library so that the apps business logic
  doesn't need to have any specific knowledge of the library.
*/

// Global npm libraries
import IpfsCoord from 'helia-coord'
import SlpWallet from 'minimal-slp-wallet'
import publicIp from 'public-ip'

// Local libraries
import config from '../../../config/index.js'

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
    // this.bchjs = new BCHJS()
    this.wallet = new SlpWallet()
    this.config = config
    this.publicIp = publicIp
    this.wallet = new SlpWallet()

    // Properties of this class instance.
    this.isReady = false

    _this = this
  }

  async start () {
    const circuitRelayInfo = {}

    // Wait for the BCH wallet to create the wallet.
    await this.wallet.walletInfoPromise

    // If configured as a Circuit Relay, get the public IP addresses for this node.
    if (this.config.isCircuitRelay) {
      try {
        const ip4 = await this.publicIp.v4()
        console.log(`Setting CIRCUIT RELAY ip4 address: ${ip4}, and port ${this.config.ipfsTcpPort}`)
        // const ip6 = await publicIp.v6()
        circuitRelayInfo.ip4 = ip4
        circuitRelayInfo.tcpPort = this.config.ipfsTcpPort
        // Domain used by browser-based secure websocket connections.
        circuitRelayInfo.crDomain = this.config.crDomain
      } catch (err) {
        /* exit quietly */
      }
    }

    const nullLog = () => {}

    const ipfsCoordOptions = {
      ipfs: this.ipfs,
      type: 'node.js',
      // type: 'browser',
      wallet: this.wallet,
      // privateLog: console.log, // Default to console.log
      privateLog: nullLog,
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
    const nullHandler = () => {}
    await this.ipfsCoord.adapters.pubsub.subscribeToPubsubChannel(this.config.chatPubSubChan, nullHandler, this.ipfsCoord.thisNode)
  }
}

export default IpfsCoordAdapter
