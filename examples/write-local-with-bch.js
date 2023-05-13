import BchWallet from 'minimal-slp-wallet'
import p2wdb from 'p2wdb'
const { Write } = p2wdb
// Replace this private key and public address with your own. You can generate
// new values at wallet.fullstack.cash.
const WIF = 'L1tcvcqa5PztqqDH4ZEcUmHA9aSHhTau5E2Zwp1xEK5CrKBrjP3m'
// BCH Address: bitcoincash:qqkg30ryje97al52htqwvveha538y7gttywut3cdqv
// SLP Address: simpleledger:qqkg30ryje97al52htqwvveha538y7gttyz8q2dd7j
// const serverURL = 'https://p2wdb.fullstack.cash'
const serverURL = 'http://localhost:5010'
// const { Write } = require('p2wdb')
async function writeNode () {
  try {
    // Instantiate the BCH wallet.
    const bchWallet = new BchWallet(WIF, { interface: 'consumer-api' })
    await bchWallet.walletInfoPromise
    await bchWallet.initialize()
    const write = new Write({ bchWallet, serverURL })
    // Generate the data that will be written to the P2WDB.
    const appId = 'test'
    const data = {
      now: new Date(),
      data: 'This is some test data.'
    }
    const result = await write.postEntry(data, appId)
    console.log(`Data about P2WDB write: ${JSON.stringify(result, null, 2)}`)
  } catch (err) {
    console.error(err)
  }
}
writeNode()
