/*
  Unit tests for the Wallet Adapter library.
*/

// Public npm libraries.
const assert = require('chai').assert
const sinon = require('sinon')
const fs = require('fs')
const BchWallet = require('minimal-slp-wallet/index')
// const BCHJS = require('@psf/bch-js')

// Local libraries.
const WalletAdapter = require('../../../src/adapters/wallet')
const { MockBchWallet } = require('../mocks/adapters/wallet')

// Global constants
const testWalletFile = `${__dirname.toString()}/test-wallet.json`

describe('#wallet', () => {
  let uut
  let sandbox

  before(() => {
    // Delete the test file if it exists.
    try {
      deleteFile(testWalletFile)
    } catch (err) {}
  })

  beforeEach(() => {
    uut = new WalletAdapter()
    sandbox = sinon.createSandbox()
  })

  afterEach(() => sandbox.restore())

  after(() => {
    // Delete the test file if it exists.
    try {
      deleteFile(testWalletFile)
    } catch (err) {}
  })

  describe('#openWallet', () => {
    it('should create a new wallet what wallet file does not exist', async () => {
      // Mock dependencies
      uut.BchWallet = MockBchWallet

      // Ensure we open the test file, not the production wallet file.
      uut.WALLET_FILE = testWalletFile

      const result = await uut.openWallet()
      // console.log('result: ', result)

      assert.property(result, 'mnemonic')
      assert.property(result, 'privateKey')
      assert.property(result, 'publicKey')
      assert.property(result, 'cashAddress')
      assert.property(result, 'address')
      assert.property(result, 'slpAddress')
      assert.property(result, 'legacyAddress')
      assert.property(result, 'hdPath')
    })

    it('should open existing wallet file', async () => {
      // This test case uses the file created in the previous test case.

      // Ensure we open the test file, not the production wallet file.
      uut.WALLET_FILE = testWalletFile

      const result = await uut.openWallet()
      // console.log('result: ', result)

      assert.property(result, 'mnemonic')
      assert.property(result, 'privateKey')
      assert.property(result, 'publicKey')
      assert.property(result, 'cashAddress')
      assert.property(result, 'address')
      assert.property(result, 'slpAddress')
      assert.property(result, 'legacyAddress')
      assert.property(result, 'hdPath')
    })

    it('should catch and throw an error', async () => {
      try {
        // Force an error
        uut.WALLET_FILE = ''
        uut.BchWallet = () => {
        }

        await uut.openWallet()
        // console.log('result: ', result)

        assert.fail('Unexpected code path')
      } catch (err) {
        // console.log('err: ', err)
        assert.include(err.message, 'this.BchWallet is not a constructor')
      }
    })
  })

  describe('#instanceWallet', () => {
    it('should create an instance of BchWallet', async () => {
      // Create a mock wallet.
      const mockWallet = new BchWallet()
      await mockWallet.walletInfoPromise
      sandbox.stub(mockWallet, 'initialize').resolves()

      // Mock dependencies
      sandbox.stub(uut, '_instanceWallet').resolves(mockWallet)

      // Ensure we open the test file, not the production wallet file.
      uut.WALLET_FILE = testWalletFile

      const walletData = await uut.openWallet()
      // console.log('walletData: ', walletData)

      const result = await uut.instanceWallet(walletData)
      // console.log('result: ', result)

      assert.property(result, 'walletInfoPromise')
      assert.property(result, 'walletInfo')
    })

    it('should catch and throw an error', async () => {
      try {
        await uut.instanceWallet()

        assert.fail('Unexpected code path')
      } catch (err) {
        // console.log('err: ', err)
        assert.include(err.message, 'Cannot read')
      }
    })

    it('should throw an error if walletData does not have a mnemonic property', async () => {
      try {
        // Ensure we open the test file, not the production wallet file.
        uut.WALLET_FILE = testWalletFile

        const walletData = await uut.openWallet()
        delete walletData.mnemonic

        await uut.instanceWallet(walletData)

        assert.fail('Unexpected code path')
      } catch (err) {
        // console.log('err: ', err)
        assert.include(err.message, 'Wallet data is not formatted correctly')
      }
    })

    it('should create an instance of BchWallet using web2 infra', async () => {
      // Create a mock wallet.
      const mockWallet = new BchWallet()
      await mockWallet.walletInfoPromise
      sandbox.stub(mockWallet, 'initialize').resolves()

      // Mock dependencies
      sandbox.stub(uut, '_instanceWallet').resolves(mockWallet)

      // Ensure we open the test file, not the production wallet file.
      uut.WALLET_FILE = testWalletFile

      const walletData = await uut.openWallet()
      // console.log('walletData: ', walletData)

      // Force desired code path
      uut.config.useFullStackCash = true

      const result = await uut.instanceWallet(walletData)
      // console.log('result: ', result)

      assert.property(result, 'walletInfoPromise')
      assert.property(result, 'walletInfo')
    })
  })

  describe('#instanceWalletWithoutInitialization', () => {
    it('should create an instance of BchWallet', async () => {
      // Create a mock wallet.
      const mockWallet = new BchWallet()
      await mockWallet.walletInfoPromise
      sandbox.stub(mockWallet, 'initialize').resolves()

      // Mock dependencies
      sandbox.stub(uut, '_instanceWallet').resolves(mockWallet)

      // Ensure we open the test file, not the production wallet file.
      uut.WALLET_FILE = testWalletFile

      const walletData = await uut.openWallet()
      // console.log('walletData: ', walletData)

      const result = await uut.instanceWalletWithoutInitialization(walletData)
      // console.log('result: ', result)

      assert.property(result, 'walletInfoPromise')
      assert.property(result, 'walletInfo')
    })

    it('should catch and throw an error', async () => {
      try {
        await uut.instanceWalletWithoutInitialization()

        assert.fail('Unexpected code path')
      } catch (err) {
        // console.log('err: ', err)
        assert.include(err.message, 'Cannot read')
      }
    })

    it('should throw an error if walletData does not have a mnemonic property', async () => {
      try {
        // Ensure we open the test file, not the production wallet file.
        uut.WALLET_FILE = testWalletFile

        const walletData = await uut.openWallet()
        delete walletData.mnemonic

        await uut.instanceWalletWithoutInitialization(walletData)

        assert.fail('Unexpected code path')
      } catch (err) {
        // console.log('err: ', err)
        assert.include(err.message, 'Wallet data is not formatted correctly')
      }
    })

    it('should create an instance of BchWallet using web2 infra', async () => {
      // Create a mock wallet.
      const mockWallet = new BchWallet()
      await mockWallet.walletInfoPromise
      sandbox.stub(mockWallet, 'initialize').resolves()

      // Mock dependencies
      sandbox.stub(uut, '_instanceWallet').resolves(mockWallet)

      // Ensure we open the test file, not the production wallet file.
      uut.WALLET_FILE = testWalletFile

      const walletData = await uut.openWallet()
      // console.log('walletData: ', walletData)

      // Force desired code path
      uut.config.useFullStackCash = true

      const result = await uut.instanceWalletWithoutInitialization(walletData)
      // console.log('result: ', result)

      assert.property(result, 'walletInfoPromise')
      assert.property(result, 'walletInfo')
    })
  })

  describe('#initialize', () => {
    it('should trigger wrapped function', async () => {
      const walletData = await uut.openWallet()
      await uut.instanceWalletWithoutInitialization(walletData)

      // Mock dependency and force desired code path.
      sandbox.stub(uut.bchWallet, 'initialize').resolves()

      const result = await uut.initialize()

      assert.equal(result, true)
    })
  })

  describe('#_instanceWallet', () => {
    it('should create a wallet given a mnemonic', async () => {
      const mnemonic = 'wagon tray learn flat erase laugh lonely rug check captain jacket morning'

      const result = await uut._instanceWallet(mnemonic)
      // console.log('result: ', result)

      assert.equal(result.walletInfo.mnemonic, mnemonic)
    })
  })

  describe('#incrementNextAddress', () => {
    it('should increment the nextAddress property', async () => {
      // Ensure we open the test file, not the production wallet file.
      uut.WALLET_FILE = testWalletFile

      // mock instance of minimal-slp-wallet
      uut.bchWallet = new MockBchWallet()

      const result = await uut.incrementNextAddress()

      assert.equal(result, 2)
    })

    it('should catch and throw an error', async () => {
      try {
        // Force an error
        sandbox.stub(uut, 'openWallet').rejects(new Error('test error'))

        await uut.incrementNextAddress()

        assert.fail('Unexpected code path')
      } catch (err) {
        assert.include(err.message, 'test error')
      }
    })
  })

  describe('#getKeyPair', () => {
    it('should return an object with a key pair', async () => {
      // Ensure we open the test file, not the production wallet file.
      uut.WALLET_FILE = testWalletFile

      // mock instance of minimal-slp-wallet
      uut.bchWallet = new MockBchWallet()

      const result = await uut.getKeyPair()
      // console.log('result: ', result)

      assert.property(result, 'cashAddress')
      assert.property(result, 'wif')
      assert.property(result, 'hdIndex')
    })

    it('should catch and throw an error', async () => {
      try {
        // Force an error
        sandbox
          .stub(uut, 'incrementNextAddress')
          .rejects(new Error('test error'))

        await uut.getKeyPair()

        assert.fail('Unexpected code path')
      } catch (err) {
        assert.include(err.message, 'test error')
      }
    })
  })
})

const deleteFile = (filepath) => {
  try {
    // Delete state if exist
    fs.unlinkSync(filepath)
  } catch (err) {
    // console.error('Error trying to delete file: ', err)
  }
}
