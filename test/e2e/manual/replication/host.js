/*
  This 'host' is intended to run on the main dev machine (Ubuntu 20, node.js v16).
  It creates the database and is the first node in the network.
*/

// Global npm libraries
// import { createOrbitDB, IPFSAccessController } from '@chris.troutner/orbitdb-helia'
import { createOrbitDB } from '@chris.troutner/orbitdb-helia'

// Local libraries
import Wallet from '../../../../src/adapters/wallet.js'
import IpfsAdapter from '../../../../src/adapters/ipfs/index.js'
import config from '../../../../config/index.js'

async function start () {
  try {
    // Initialize wallet.
    const wallet = new Wallet()
    await wallet.instanceWalletWithoutInitialization({}, {})
    console.log('wallet info: ', wallet.bchWallet.walletInfo)
    const bchjs = wallet.bchWallet.bchjs

    config.debugLevel = 0

    const ipfsAdapter = new IpfsAdapter()
    await ipfsAdapter.start({ bchjs })

    const orbitdb = await createOrbitDB({
      ipfs: ipfsAdapter.ipfs,
      directory: './.ipfsdata/test/dbs/keyvalue'
    })

    // const db = await orbitdb.open(`replica-test-001`, {
    //   type: 'keyvalue',
    //   AccessController: IPFSAccessController({ write: ['*'] })
    //  })
    const db = await orbitdb.open('/orbitdb/zdpuAwYHUxZY4yeCyTAGk4eMFd916rk1pHNnuD1JMT7zadoiL')
    console.log('db.address: ', db.address)

    const key = Math.floor(Math.random() * 1000).toString()
    const value = Math.floor(Math.random() * 1000)
    const hash = await db.put(key, value)

    console.log(`Added key ${key}, with value ${value} to DB with entry ${hash}`)
  } catch (err) {
    console.error('Error with host: ', err)
  }
}
start()
