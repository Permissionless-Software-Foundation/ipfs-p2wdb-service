/*
  This is a Clean Architecture adapter library for interfacing with an IPFS
  Helia node.
*/

// Global npm libraries
import { createHelia } from 'helia'
// import { unixfs } from '@helia/unixfs'
import { FsBlockstore } from 'blockstore-fs'
import { FsDatastore } from 'datastore-fs'
import { createLibp2p } from 'libp2p'
import { tcp } from '@libp2p/tcp'
import { noise } from '@chainsafe/libp2p-noise'
import { yamux } from '@chainsafe/libp2p-yamux'
import { bootstrap } from '@libp2p/bootstrap'
import { identifyService } from 'libp2p/identify'
import { gossipsub } from '@chainsafe/libp2p-gossipsub'

// import IPFSembedded from 'ipfs'
import { create } from 'ipfs-http-client'
import fs from 'fs'
// import http from 'http'

// Local libraries
import config from '../../../config/index.js'

const IPFS_DIR = './.ipfsdata/ipfs'

class IpfsAdapter {
  constructor (localConfig) {
    // Encapsulate dependencies
    this.config = config
    // Choose the IPFS constructor based on the config settings.
    // this.IPFS = IPFSembedded // default
    // if (this.config.isProduction) {
    // this.IPFS = IPFSexternal
    this.create = create
    // }
    // Properties of this class instance.
    this.isReady = false
    this.fs = fs
  }

  // Start an IPFS node.
  async start () {
    try {
      // Ipfs Options
      // const ipfsOptionsEmbedded = {
      //   repo: IPFS_DIR,
      //   start: true,
      //   config: {
      //     relay: {
      //       enabled: true,
      //       hop: {
      //         enabled: config.isCircuitRelay // enable circuit relay HOP (make this node a relay)
      //       }
      //     },
      //     pubsub: true,
      //     Swarm: {
      //       ConnMgr: {
      //         HighWater: 30,
      //         LowWater: 10
      //       }
      //     },
      //     Addresses: {
      //       Swarm: [
      //         `/ip4/0.0.0.0/tcp/${this.config.ipfsTcpPort}`,
      //         `/ip4/0.0.0.0/tcp/${this.config.ipfsWsPort}/ws`
      //       ]
      //     },
      //     Datastore: {
      //       StorageMax: '2GB',
      //       StorageGCWatermark: 50,
      //       GCPeriod: '15m'
      //     }
      //   }
      // }

      // const ipfsOptionsExternal = {
      //   host: this.config.ipfsHost,
      //   port: this.config.ipfsApiPort,
      //   agent: http.Agent({ keepAlive: true, maxSockets: 2000 })
      // }
      // let ipfsOptions = ipfsOptionsEmbedded

      // if (this.config.isProduction) {
      //   ipfsOptions = ipfsOptionsExternal
      // }

      // Create a new IPFS node.
      // this.ipfs = await this.create(ipfsOptions)

      // Set the 'server' profile so the node does not scan private networks.
      // await this.ipfs.config.profiles.apply('server')

      // Create an IPFS node
      const ipfs = await this.createNode()
      // console.log('ipfs: ', ipfs)

      // Get the multiaddrs for the node.
      const multiaddrs = ipfs.libp2p.getMultiaddrs()
      console.log('Multiaddrs: ', multiaddrs)
      console.log('ipfs.id: ', ipfs.id)

      // Debugging: Display IPFS config settings.
      // const configSettings = await this.ipfs.config.getAll()
      // console.log(`configSettings: ${JSON.stringify(configSettings, null, 2)}`)
      // Signal that this adapter is ready.
      this.isReady = true

      this.ipfs = ipfs
      return this.ipfs
    } catch (err) {
      console.error('Error in ipfs.js/start()')
      // If IPFS crashes because the /blocks directory is full, wipe the directory.
      // if (err.message.includes('No space left on device')) {
      //   this.rmBlocksDir()
      // }
      throw err
    }
  }

  // This function creates an IPFS node using Helia.
  // It returns the node as an object.
  async createNode () {
    try {
      // Create block and data stores.
      const blockstore = new FsBlockstore(`${IPFS_DIR}/blockstore`)
      const datastore = new FsDatastore(`${IPFS_DIR}/datastore`)

      // libp2p is the networking layer that underpins Helia
      const libp2p = await createLibp2p({
        datastore,
        addresses: {
          listen: [
            '/ip4/127.0.0.1/tcp/0',
            `/ip4/0.0.0.0/tcp/${this.config.ipfsTcpPort}`
          ]
        },
        transports: [
          tcp()
        ],
        connectionEncryption: [
          noise()
        ],
        streamMuxers: [
          yamux()
        ],
        peerDiscovery: [
          bootstrap({
            list: [
              // '/dnsaddr/bootstrap.libp2p.io/p2p/QmNnooDu7bfjPFoTZYxMNLWUQJyrVwtbZg5gBMjTezGAJN',
              // '/dnsaddr/bootstrap.libp2p.io/p2p/QmQCU2EcMqAqQPR2i9bChDtGNJchTbq5TbXJJ16u19uLTa',
              // '/dnsaddr/bootstrap.libp2p.io/p2p/QmbLHAnMoJPWSCR5Zhtx6BHJX9KiKNN6tpvbUcqanj75Nb',
              // '/dnsaddr/bootstrap.libp2p.io/p2p/QmcZf59bWwK5XFi76CZX8cbJ4BhTzzA3gU1ZjYZcYW3dwt'
              '/ip4/5.161.108.190/tcp/4102/p2p/12D3KooWKNuBjaMgEDN2tGqzmdfM2bmd22VEuboC4X7x8ua4DvUg',
              '/ip4/5.161.108.190/tcp/4001/p2p/12D3KooWMW3u8ygGHqNHjxXsw7TA39vgrSQEx7vEGoUh7EiCwGGv',
              '/ip4/137.184.13.92/tcp/4001/p2p/12D3KooWMbpo92kSGwWiN6QH7fvstMWiLZKcxmReq3Hhbpya2bq4',
              '/ip4/78.46.129.7/tcp/4001/p2p/12D3KooWJyc54njjeZGbLew4D8u1ghrmZTTPyh3QpBF7dxtd3zGY',
              '/ip4/5.161.72.148/tcp/4001/p2p/12D3KooWAVG5kn46P9mjKCLUSPesmmLeKf2a79qRt6u22hJaEARJ'
            ]
          })
        ],
        services: {
          identify: identifyService(),
          pubsub: gossipsub({ allowPublishToZeroPeers: true })
        }
      })

      // create a Helia node
      const helia = await createHelia({
        blockstore,
        datastore,
        libp2p
      })

      return helia
    } catch (err) {
      console.error('Error creating Helia node: ', err)
    }
  }

  async stop () {
    await this.ipfs.stop()
    return true
  }
}
export default IpfsAdapter
