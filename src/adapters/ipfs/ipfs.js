/*
  This is a Clean Architecture adapter library for interfacing with an IPFS
  Helia node.
*/

// Global npm libraries
import { createHelia } from 'helia'
import fs from 'fs'
import { FsBlockstore } from 'blockstore-fs'
import { FsDatastore } from 'datastore-fs'
import { createLibp2p } from 'libp2p'
import { tcp } from '@libp2p/tcp'
import { noise } from '@chainsafe/libp2p-noise'
import { yamux } from '@chainsafe/libp2p-yamux'
import { bootstrap } from '@libp2p/bootstrap'
import { identifyService } from 'libp2p/identify'
import { circuitRelayServer, circuitRelayTransport } from 'libp2p/circuit-relay'
import { gossipsub } from '@chainsafe/libp2p-gossipsub'
import { webSockets } from '@libp2p/websockets'

// Local libraries
import config from '../../../config/index.js'

// Hack to get __dirname back.
// https://blog.logrocket.com/alternatives-dirname-node-js-es-modules/
import * as url from 'url'
const __dirname = url.fileURLToPath(new URL('.', import.meta.url))
// console.log('__dirname: ', __dirname)

const ROOT_DIR = `${__dirname}../../../`
const IPFS_DIR = `${__dirname}../../../.ipfsdata/ipfs`

class IpfsAdapter {
  constructor (localConfig) {
    // Encapsulate dependencies
    this.config = config
    this.fs = fs
    this.createLibp2p = createLibp2p

    // Properties of this class instance.
    this.isReady = false
    this.multiaddrs = null
    this.id = null

    // Bind 'this' object to all subfunctions
    this.start = this.start.bind(this)
    this.createNode = this.createNode.bind(this)
    this.stop = this.stop.bind(this)
    this.ensureBlocksDir = this.ensureBlocksDir.bind(this)
  }

  // Start an IPFS node.
  async start () {
    try {
      // Ensure the directory structure exists that is needed by the IPFS node to store data.
      this.ensureBlocksDir()

      // Create an IPFS node
      const ipfs = await this.createNode()
      // console.log('ipfs: ', ipfs)

      // Get the multiaddrs for the node.
      const multiaddrs = ipfs.libp2p.getMultiaddrs()
      console.log('Multiaddrs: ', multiaddrs)

      this.multiaddrs = multiaddrs
      this.id = ipfs.libp2p.peerId.toString()
      console.log('IPFS ID: ', this.id)

      // Signal that this adapter is ready.
      this.isReady = true

      this.ipfs = ipfs

      return this.ipfs
    } catch (err) {
      console.error('Error in ipfs.js/start()')
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

      // Configure services
      const services = {
        identify: identifyService(),
        pubsub: gossipsub({ allowPublishToZeroPeers: true })
      }
      if (this.config.isCircuitRelay) {
        console.log('Helia (IPFS) node IS configured as Circuit Relay')
        services.relay = circuitRelayServer()
      } else {
        console.log('Helia (IPFS) node IS NOT configured as Circuit Relay')
      }

      // libp2p is the networking layer that underpins Helia
      const libp2p = await this.createLibp2p({
        datastore,
        addresses: {
          listen: [
            '/ip4/127.0.0.1/tcp/0',
            `/ip4/0.0.0.0/tcp/${this.config.ipfsTcpPort}`,
            `/ip4/0.0.0.0/tcp/${this.config.ipfsWsPort}/ws`
          ]
        },
        transports: [
          tcp(),
          webSockets(),
          circuitRelayTransport({ discoverRelays: 3 })
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
              '/ip4/5.161.72.148/tcp/4001/p2p/12D3KooWAVG5kn46P9mjKCLUSPesmmLeKf2a79qRt6u22hJaEARJ',
              '/ip4/161.35.99.207/tcp/4001/p2p/12D3KooWDtj9cfj1SKuLbDNKvKRKSsGN8qivq9M8CYpLPDpcD5pu',

              // helia-p2wdb-dev-server-01 prototype P2WDB server using Helia (Token Tiger)
              '/ip4/137.184.93.145/tcp/4001/p2p/12D3KooWGZCpD5Ue3CJCBBEKowcuKEgeVKbTM7VMbJ8xm1bqST1j',

              // v1 & v2 Circuit Relay (Token Tiger)
              '/ip4/137.184.93.145/tcp/6001/p2p/12D3KooWBTkiEn4fSGYRMtNT2ZTKhjguymGFHjiJeVVPSwEjXJwq',

              // v1 & v2 Circuit Relay server (FullStack.cash)
              '/ip4/78.46.129.7/tcp/4002/p2p/12D3KooWBigV2M3Sx4KmM3m2DQMznnZzyNuXPawPsZWRpZmiJ8Kp',

              // helia-p2wdb-dev-server-01 prototype P2WDB server using Helia (FullStack.cash)
              '/ip4/78.46.129.7/tcp/7001/p2p/12D3KooWBigV2M3Sx4KmM3m2DQMznnZzyNuXPawPsZWRpZmiJ8Kp'
            ]
          })
        ],
        services
      })

      // console.log(`Node started with id ${libp2p.peerId.toString()}`)
      // console.log('Listening on:')
      // libp2p.getMultiaddrs().forEach((ma) => console.log(ma.toString()))

      // create a Helia node
      const helia = await createHelia({
        blockstore,
        datastore,
        libp2p
      })

      return helia
    } catch (err) {
      console.error('Error creating Helia node: ', err)

      throw err
    }
  }

  async stop () {
    await this.ipfs.stop()
    return true
  }

  // Ensure that the directories exist to store blocks from the IPFS network.
  // This function is called at startup, before the IPFS node is started.
  ensureBlocksDir () {
    try {
      !this.fs.existsSync(`${ROOT_DIR}.ipfsdata`) && this.fs.mkdirSync(`${ROOT_DIR}.ipfsdata`)

      !this.fs.existsSync(`${IPFS_DIR}`) && this.fs.mkdirSync(`${IPFS_DIR}`)

      !this.fs.existsSync(`${IPFS_DIR}/blockstore`) && this.fs.mkdirSync(`${IPFS_DIR}/blockstore`)

      !this.fs.existsSync(`${IPFS_DIR}/datastore`) && this.fs.mkdirSync(`${IPFS_DIR}/datastore`)

      return true
    } catch (err) {
      console.error('Error in adapters/ipfs.js/ensureBlocksDir(): ', err)
      throw err
    }
  }
}

export default IpfsAdapter
