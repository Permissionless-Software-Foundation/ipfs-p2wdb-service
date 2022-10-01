/*
  Adapter library for working with a wallet.
*/

// Public npm libraries
const BchWallet = require('minimal-slp-wallet/index')

// Local libraries
const JsonFiles = require('./json-files')
const config = require('../../config')

const WALLET_FILE = `${__dirname.toString()}/../../wallet.json`

class WalletAdapter {
  constructor (localConfig = {}) {
    // Encapsulate dependencies
    this.jsonFiles = new JsonFiles()
    this.WALLET_FILE = WALLET_FILE
    this.BchWallet = BchWallet
    this.config = config
  }

  // Open the wallet file, or create one if the file doesn't exist.
  // Does not instance the wallet. The output of this function is expected to
  // be passed to instanceWallet().
  async openWallet () {
    try {
      let walletData

      // Try to open the wallet.json file.
      try {
        // console.log('this.WALLET_FILE: ', this.WALLET_FILE)
        walletData = await this.jsonFiles.readJSON(this.WALLET_FILE)
      } catch (err) {
        // Create a new wallet file if one does not already exist.
        // console.log('Wallet file not found. Creating new wallet.json file.')

        // Create a new wallet.
        // No-Update flag creates wallet without making any network calls.
        const walletInstance = new this.BchWallet(undefined, { noUpdate: true })

        // Wait for wallet to initialize.
        await walletInstance.walletInfoPromise

        walletData = walletInstance.walletInfo

        // Add the nextAddress property
        walletData.nextAddress = 1

        // Write the wallet data to the JSON file.
        await this.jsonFiles.writeJSON(walletData, this.WALLET_FILE)
      }

      // console.log('walletData: ', walletData)

      return walletData
    } catch (err) {
      console.error('Error in openWallet()')
      throw err
    }
  }

  // Create an instance of minimal-slp-wallet. Use data in the wallet.json file,
  // and pass the bch-js information to the minimal-slp-wallet library.
  async instanceWallet (walletData) {
    try {
      // console.log(`instanceWallet() walletData: ${JSON.stringify(walletData, null, 2)}`)

      // TODO: throw error if wallet data is not passed in.
      if (!walletData.mnemonic) {
        throw new Error('Wallet data is not formatted correctly. Can not read mnemonic in wallet file!')
      }

      const advancedConfig = {}
      console.log(`Using FullStack.cash: ${this.config.useFullStackCash}`)
      if (this.config.useFullStackCash) {
        advancedConfig.interface = 'rest-api'
        advancedConfig.restURL = this.config.apiServer
        advancedConfig.apiToken = this.config.apiToken
      } else {
        advancedConfig.interface = 'consumer-api'
        advancedConfig.restURL = this.config.consumerUrl
      }

      // Instantiate minimal-slp-wallet.
      // this.bchWallet = new this.BchWallet(walletData.mnemonic, advancedConfig)
      this.bchWallet = await this._instanceWallet(walletData.mnemonic, advancedConfig)

      // Wait for wallet to initialize.
      await this.bchWallet.walletInfoPromise
      console.log(`BCH wallet initialized. Wallet address: ${this.bchWallet.walletInfo.cashAddress}`)
      // console.log(`this.bchWallet.walletInfo: ${JSON.stringify(this.bchWallet.walletInfo, null, 2)}`)

      // Initialize the wallet
      await this.bchWallet.initialize()

      return this.bchWallet
    } catch (err) {
      console.error('Error in instanceWallet()')
      throw err
    }
  }

  // This is simply a wrapper for the initialize() function built into minimal-slp-wallet.
  async initialize () {
    await this.bchWallet.initialize()

    return true
  }

  // ToDo: this function below should be phased out in favor of calling
  // initialize() above.
  //
  // This is used for initializing the wallet, without waiting to update the wallet
  // UTXOs from the blockchain.
  // This is useful when the wallet is simply needed to make calls to the blockchain,
  // and there is no need to hydrate it with UTXO data.
  async instanceWalletWithoutInitialization (walletData) {
    try {
      // console.log(`instanceWallet() walletData: ${JSON.stringify(walletData, null, 2)}`)

      // TODO: throw error if wallet data is not passed in.
      if (!walletData.mnemonic) {
        throw new Error('Wallet data is not formatted correctly. Can not read mnemonic in wallet file!')
      }

      const advancedConfig = {}
      if (this.config.useFullStackCash) {
        advancedConfig.interface = 'rest-api'
        advancedConfig.restURL = this.config.apiServer
        advancedConfig.apiToken = this.config.apiToken
      } else {
        advancedConfig.interface = 'consumer-api'
        advancedConfig.restURL = this.config.consumerUrl
      }

      // Instantiate minimal-slp-wallet.
      // this.bchWallet = new this.BchWallet(walletData.mnemonic, advancedConfig)
      this.bchWallet = await this._instanceWallet(walletData.mnemonic, advancedConfig)

      // Wait for wallet to initialize.
      await this.bchWallet.walletInfoPromise
      console.log(`BCH wallet initialized. Wallet address: ${this.bchWallet.walletInfo.cashAddress}`)
      // console.log(`this.bchWallet.walletInfo: ${JSON.stringify(this.bchWallet.walletInfo, null, 2)}`)

      // Initialize the wallet
      // await this.bchWallet.initialize()

      return this.bchWallet
    } catch (err) {
      console.error('Error in instanceWalletWithoutInitialization()')
      throw err
    }
  }

  // This function is used for easier mocking of unit tests.
  async _instanceWallet (mnemonic, config) {
    const wallet = new this.BchWallet(mnemonic, config)
    await wallet.walletInfoPromise
    return wallet
  }

  // Increments the 'nextAddress' property in the wallet file. This property
  // indicates the HD index that should be used to generate a key pair for
  // storing funds for Offers.
  // This function opens the wallet file, increments the nextAddress property,
  // then saves the change to the wallet file.
  async incrementNextAddress () {
    try {
      const walletData = await this.openWallet()
      // console.log('original walletdata: ', walletData)

      walletData.nextAddress++

      // console.log('walletData finish: ', walletData)
      await this.jsonFiles.writeJSON(walletData, this.WALLET_FILE)

      // Update the working instance of the wallet.
      this.bchWallet.walletInfo.nextAddress++
      // console.log('this.bchWallet.walletInfo: ', this.bchWallet.walletInfo)

      return walletData.nextAddress
    } catch (err) {
      console.error('Error in incrementNextAddress()')
      throw err
    }
  }

  // This method returns an object that contains a private key WIF, public address,
  // and the index of the HD wallet that the key pair was generated from.
  // TODO: Allow input integer. If input is used, use that as the index. If no
  // input is provided, then call incrementNextAddress().
  async getKeyPair (hdIndex = 0) {
    try {
      if (!hdIndex) {
        // Increment the HD index and generate a new key pair.
        hdIndex = await this.incrementNextAddress()
      }

      const mnemonic = this.bchWallet.walletInfo.mnemonic

      // root seed buffer
      const rootSeed = await this.bchWallet.bchjs.Mnemonic.toSeed(mnemonic)

      const masterHDNode = this.bchWallet.bchjs.HDNode.fromSeed(rootSeed)

      // HDNode of BIP44 account
      // const account = this.bchWallet.bchjs.HDNode.derivePath(masterHDNode, "m/44'/245'/0'")

      const childNode = masterHDNode.derivePath(`m/44'/245'/0'/0/${hdIndex}`)

      const cashAddress = this.bchWallet.bchjs.HDNode.toCashAddress(childNode)
      console.log('Generating a new key pair for cashAddress: ', cashAddress)

      const wif = this.bchWallet.bchjs.HDNode.toWIF(childNode)

      const outObj = {
        cashAddress,
        wif,
        hdIndex
      }

      return outObj
    } catch (err) {
      console.error('Error in getKeyPair()')
      throw err
    }
  }
}

module.exports = WalletAdapter
