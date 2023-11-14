/*
  This 'host' is intended to run on the main dev machine (Ubuntu 20, node.js v16).
  It creates the database and is the first node in the network.
*/

// Global npm libraries
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

    const db = await orbitdb.open('/orbitdb/zdpuAwYHUxZY4yeCyTAGk4eMFd916rk1pHNnuD1JMT7zadoiL')
    console.log('OrbitDB opened: ', db.address)

    // We only have the latest record of db1. To replicate all of db1's records, we will
    // need to iterate over db1's entire record set.
    // We can determine when heads have been synchronized from db1 to db2 by
    // listening for the "update" event and iterating over the record set.
    let recordCnt = 0
    db.events.on('update', async (entry) => {
      for await (const record of db.iterator()) {
        console.log(record)
        recordCnt++
      }
      console.log(`Database has this many records: ${recordCnt}`)
    })
  } catch (err) {
    console.error('Error with host: ', err)
  }
}
start()
