/*
  Adapted from the burn-tokens.js example. This example burns a token and
  writes an Object as clear-text JSON string to the database.
*/

const axios = require('axios')

// CUSTOMIZE THESE VALUES FOR YOUR USE
// Private key holding the tokens and some BCH.
const WIF = process.env.WIF
if (!WIF) throw new Error('Add WIF to environment variable.')

// fullstack.cash jwt
const BCHJSTOKEN = process.env.JWT

// The BCH address corresponding to the WIF.
const BCHADDR = 'bitcoincash:qr8l8vams89ravr8l3w2duy900lpmtrj6g7mzkwdaa'

const MESSAGE = 'test'

const SIGNATURE =
  'H6+EE2Vh8boeW5CVDd/8+MfOWLG4DtLD93guAKIx1TgIJQS5drxHhS0Er0M/XL2nDe2BhOHmwnUzRyscnDK0X18='

const TOKENID =
  '38e97c5d7d3585a2cbf3f9580c82ca33985f9cb0845d4dcce220cb709f9538b0'
const TOKENQTY = 0.01

// const SERVER = 'http://localhost:5001/entry/write'
// const SERVER = 'http://192.168.0.76:5001/entry/write'
const SERVER = 'https://p2wdb.fullstack.cash/entry/write'

const dataObj = {
  appId: 'torlist', // Webhook appId
  data: {
    // data to send from webhook
    entry: {
      entry: 'example.com',
      signature:
        'INkbSO4Pq9NYTqzCAIE61yr3mkC7exATlsV3RHdsqzryPYAXPJN+vfM6LcOvkTKsS7hAnTZ2MaPOoq9fs5Xkc1Q=',
      slpAddress: 'simpleledger:qr8l8vams89ravr8l3w2duy900lpmtrj6gjqfdmdrr',
      description: 'webhook test',
      category: 'Bitcoin Cash'
    }
  }
}
console.log(
  `Adding this object to the P2WDB: ${JSON.stringify(dataObj, null, 2)}`
)

// REST API servers.
const BCHN_MAINNET = 'https://bchn.fullstack.cash/v5/'
// bch-js-examples require code from the main bch-js repo
const BCHJS = require('@psf/bch-js')

const bchjsOptions = { restURL: BCHN_MAINNET }
if (BCHJSTOKEN) bchjsOptions.apiToken = BCHJSTOKEN

const bchjs = new BCHJS(bchjsOptions)

async function burnAndWrite () {
  try {
    const keyPair = bchjs.ECPair.fromWIF(WIF)

    // Get UTXOs held by this address.
    const data = await bchjs.Electrumx.utxo(BCHADDR)
    const utxos = data.utxos
    // console.log(`utxos: ${JSON.stringify(utxos, null, 2)}`)

    if (utxos.length === 0) throw new Error('No UTXOs to spend! Exiting.')

    // Identify the SLP token UTXOs.
    let tokenUtxos = await bchjs.SLP.Utils.tokenUtxoDetails(utxos)
    // console.log(`tokenUtxos: ${JSON.stringify(tokenUtxos, null, 2)}`)

    // Filter out the non-SLP token UTXOs.
    const bchUtxos = utxos.filter((utxo, index) => {
      const tokenUtxo = tokenUtxos[index]

      if (!tokenUtxo.isValid) return true

      return false
    })
    // console.log(`bchUTXOs: ${JSON.stringify(bchUtxos, null, 2)}`)

    if (bchUtxos.length === 0) {
      throw new Error('Wallet does not have a BCH UTXO to pay miner fees.')
    }

    // Filter out the token UTXOs that match the user-provided token ID.
    tokenUtxos = tokenUtxos.filter((utxo, index) => {
      if (
        utxo && // UTXO is associated with a token.
        utxo.tokenId === TOKENID && // UTXO matches the token ID.
        utxo.utxoType === 'token' // UTXO is not a minting baton.
      ) {
        return true
      }

      return false
    })
    // console.log(`tokenUtxos: ${JSON.stringify(tokenUtxos, null, 2)}`);

    if (tokenUtxos.length === 0) {
      throw new Error('No token UTXOs for the specified token could be found.')
    }

    // Choose a UTXO to pay for the transaction.
    const bchUtxo = bchjs.Utxo.findBiggestUtxo(bchUtxos)
    console.log(`bchUtxo: ${JSON.stringify(bchUtxo, null, 2)}`)

    // Generate the SLP OP_RETURN.
    const slpData = bchjs.SLP.TokenType1.generateBurnOpReturn(
      tokenUtxos,
      TOKENQTY
    )

    // BEGIN transaction construction.

    // instance of transaction builder
    const transactionBuilder = new bchjs.TransactionBuilder()

    // Add the BCH UTXO as input to pay for the transaction.
    const originalAmount = bchUtxo.value
    transactionBuilder.addInput(bchUtxo.tx_hash, bchUtxo.tx_pos)

    // add each token UTXO as an input.
    for (let i = 0; i < tokenUtxos.length; i++) {
      transactionBuilder.addInput(tokenUtxos[i].tx_hash, tokenUtxos[i].tx_pos)
    }

    // get byte count to calculate fee. paying 1 sat
    // Note: This may not be totally accurate. Just guessing on the byteCount size.
    // const byteCount = this.BITBOX.BitcoinCash.getByteCount(
    //   { P2PKH: 3 },
    //   { P2PKH: 5 }
    // )
    // //console.log(`byteCount: ${byteCount}`)
    // const satoshisPerByte = 1.1
    // const txFee = Math.floor(satoshisPerByte * byteCount)
    // console.log(`txFee: ${txFee} satoshis\n`)
    const txFee = 250

    // amount to send back to the sending address. It's the original amount - 1 sat/byte for tx size
    const remainder = originalAmount - txFee - 546
    if (remainder < 1) {
      throw new Error('Selected UTXO does not have enough satoshis')
    }
    // console.log(`remainder: ${remainder}`)

    // Add OP_RETURN as first output.
    transactionBuilder.addOutput(slpData, 0)

    // Send the token back to the same wallet if the user hasn't specified a
    // different address.
    // if (TO_SLPADDR === "") TO_SLPADDR = walletInfo.slpAddress;

    // Send dust transaction representing tokens being sent.
    transactionBuilder.addOutput(
      bchjs.SLP.Address.toLegacyAddress(BCHADDR),
      546
    )

    // Last output: send the BCH change back to the wallet.
    transactionBuilder.addOutput(
      bchjs.Address.toLegacyAddress(BCHADDR),
      remainder
    )

    // Sign the transaction with the private key for the BCH UTXO paying the fees.
    let redeemScript
    transactionBuilder.sign(
      0,
      keyPair,
      redeemScript,
      transactionBuilder.hashTypes.SIGHASH_ALL,
      originalAmount
    )

    // Sign each token UTXO being consumed.
    for (let i = 0; i < tokenUtxos.length; i++) {
      const thisUtxo = tokenUtxos[i]

      transactionBuilder.sign(
        1 + i,
        keyPair,
        redeemScript,
        transactionBuilder.hashTypes.SIGHASH_ALL,
        thisUtxo.value
      )
    }

    // build tx
    const tx = transactionBuilder.build()

    // output rawhex
    const hex = tx.toHex()
    // console.log(`Transaction raw hex: `, hex)

    // END transaction construction.

    // Broadcast transation to the network
    const txidStr = await bchjs.RawTransactions.sendRawTransaction([hex])
    console.log(`Transaction ID: ${txidStr}`)

    console.log('Check the status of your transaction on this block explorer:')
    console.log(`https://explorer.bitcoin.com/bch/tx/${txidStr}`)
    console.log(' ')

    // Sleep for 5 seconds.
    await bchjs.Util.sleep(5000)

    const bodyData = {
      // const result = await axios.post('https://p2wdb.fullstackcash.nl/p2wdb', {
      txid: txidStr[0],
      message: MESSAGE,
      signature: SIGNATURE,
      data: JSON.stringify(dataObj)
    }
    console.log(`bodyData: ${JSON.stringify(bodyData, null, 2)}`)

    // Submit the txid as proof-of-burn to write data to the database.
    const result = await axios.post(SERVER, bodyData)
    console.log(`Response from API: ${JSON.stringify(result.data, null, 2)}`)
  } catch (err) {
    console.error('Error in burnTokens: ', err)
    console.log(`Error message: ${err.message}`)
  }
}
burnAndWrite()
