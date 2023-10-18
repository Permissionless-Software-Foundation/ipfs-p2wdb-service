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
import fs from 'fs'

// Local libraries
import config from '../../../config/index.js'

const IPFS_DIR = './.ipfsdata/ipfs'

class IpfsAdapter {
  constructor (localConfig) {
    // Encapsulate dependencies
    this.config = config
    this.fs = fs

    // Properties of this class instance.
    this.isReady = false
    this.multiaddrs = null
    this.id = null
  }

  // Start an IPFS node.
  async start () {
    try {
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
              '/ip4/5.161.72.148/tcp/4001/p2p/12D3KooWAVG5kn46P9mjKCLUSPesmmLeKf2a79qRt6u22hJaEARJ',
              '/ip4/161.35.99.207/tcp/4001/p2p/12D3KooWDtj9cfj1SKuLbDNKvKRKSsGN8qivq9M8CYpLPDpcD5pu'
              // '/ip4/192.168.2.173/tcp/4001/p2p/12D3KooWAz2hbriyU9o1wHNU2nxqG8mMgAdWnXCSfWiv5kxSfW49'
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
