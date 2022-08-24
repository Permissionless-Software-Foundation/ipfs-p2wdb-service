/*
  Unit tests for the P2WDB Add Entry Use Cases
*/

// Global npm libraries
const assert = require('chai').assert
const sinon = require('sinon')
const BchWallet = require('minimal-slp-wallet/index')
const clone = require('lodash.clonedeep')

// Local libraries
const AddEntry = require('../../../../src/use-cases/entry/add-entry')

// Mocks
const adaptersMock = require('../../mocks/adapters')

let sandbox
let uut
let rawData

describe('#AddEntry', () => {
  before(async () => {})

  beforeEach(() => {
    // uut = new AddEntry({
    //   p2wdbAdapter: adaptersMock.p2wdb,
    //   entryAdapter: adaptersMock.entry
    // })

    // console.log('adaptersMock: ', adaptersMock)
    const adapters = clone(adaptersMock)
    // console.log('adapters: ', adapters)
    uut = new AddEntry({ adapters })

    rawData = {
      hash: 'zdpuAuxCW346zUG71Aai21Y31EJ1XNxcjXV5rz93DxftKnpjn',
      txid: '0fc58bdd91ff92cb47387d950a505d934b3776a1b2544ea9b53102d4697ef91f',
      message: 'test',
      signature:
        'IA8LCUnN6TUocSGnCe9nA1T4D+9hurJJ0vi3vBEJvAVwFfGcZ9ZlIWdR1m30wAxO4r0wb3YSzrM3QynpfgKUW/w=',
      data:
        '{"appId":"test","title":"7170","sourceUrl":"63156","ipfsUrl":"73680","timestamp":"2021-06-23T00:26:51.789Z","localTimestamp":"6/22/2021, 5:26:51 PM"}'
    }

    sandbox = sinon.createSandbox()
  })

  afterEach(() => sandbox.restore())

  describe('#constructor', () => {
    it('should throw an error if adapters instance is not included', () => {
      try {
        uut = new AddEntry()

        assert.fail('Unexpected code path')
      } catch (err) {
        assert.include(
          err.message,
          'Instance of adapters must be passed in when instantiating Entry Use Cases library.'
        )
      }
    })

    it('should throw an error if p2wdb instance is not included', () => {
      try {
        const adapters = clone(adaptersMock)
        delete adapters.p2wdb

        uut = new AddEntry({ adapters })

        assert.fail('Unexpected code path')
      } catch (err) {
        assert.include(
          err.message,
          'p2wdb adapter instance must be included when instantiating AddEntry'
        )
      }
    })

    it('should throw an error if entry adapter instance is not included', () => {
      try {
        const adapters = clone(adaptersMock)
        delete adapters.entry

        uut = new AddEntry({ adapters })

        assert.fail('Unexpected code path')
      } catch (err) {
        assert.include(
          err.message,
          'entry adapter instance must be included when instantiating AddEntry use case'
        )
      }
    })
  })

  describe('#addUserEntry', () => {
    it('should throw an error if entry already exists in the database.', async () => {
      try {
        // Mock dependencies.
        sandbox.stub(uut.entryAdapter, 'doesEntryExist').resolves(true)

        await uut.addUserEntry(rawData)

        assert.fail('Unexpected code path')
      } catch (err) {
        assert.include(err.message, 'Entry already exists in the database.')
      }
    })

    it('should add an entry to the P2WDB', async () => {
      // Mock dependencies
      // console.log('uut.entryAdapter: ', uut.entryAdapter)
      sandbox.stub(uut.entryAdapter, 'doesEntryExist').resolves(false)
      sandbox.stub(uut.p2wdbAdapter, 'insert').resolves('test-hash')

      const result = await uut.addUserEntry(rawData)

      assert.equal(result, 'test-hash')
    })
  })

  describe('#addPeerEntry', () => {
    it('should throw an error if entry already exists in the database.', async () => {
      try {
        // Mock dependencies.
        sandbox.stub(uut.entryAdapter, 'doesEntryExist').resolves(true)

        await uut.addPeerEntry(rawData)

        assert.fail('Unexpected code path')
      } catch (err) {
        assert.include(err.message, 'Entry already exists in the database.')
      }
    })

    it('should add an entry to the P2WDB', async () => {
      // Mock dependencies
      sandbox.stub(uut.entryAdapter, 'doesEntryExist').resolves(false)

      const result = await uut.addPeerEntry(rawData)

      assert.equal(result, true)
    })
  })

  describe('#_extractAppId', () => {
    it('should extract appId from data', () => {
      // Create test data for input.
      const peerData = {
        data: {
          appId: 'test'
        }
      }
      peerData.data = JSON.stringify(peerData.data)

      const result = uut._extractAppId(peerData)
      // console.log('result: ', result)

      assert.equal(result.appId, 'test')
    })

    it('should exit quietly when there is an error, and returns input data.', () => {
      // Create test data for input.
      let peerData = {
        data: {
          appId: 'test'
        }
      }
      peerData = JSON.stringify(peerData)

      const result = uut._extractAppId(peerData)
      // console.log('result: ', result)

      assert.include(result, 'test')
    })
  })

  describe('#addBchEntry', () => {
    it('should write an entry to the P2WDB', async () => {
      // Mock dependencies
      sandbox.stub(uut.adapters.localdb.BchPayment, 'findOne').resolves({
        _id: '63054bb29ebc5f612533845a',
        address: 'bitcoincash:qqy9qhr67mq6fcudvq8vgnzrn798gf3wjyfyhapz59',
        hdIndex: '5',
        timeCreated: '2022-08-23T21:50:42.253Z',
        bchCost: '0.00011073',
        __v: 0,
        remove: async () => {}
      })
      sandbox.stub(uut.adapters.wallet.bchWallet, 'getBalance').resolves(11073)
      sandbox.stub(uut.adapters.wallet, 'getKeyPair').resolves({
        cashAddress: 'bitcoincash:qza7sy8jnljkhtt7tgnq5z7f8g7wjgumcyj8rc8duu',
        wif: 'L2WXayLcTiX6GoZ9Mk5tPNRDVcmYhFP5KMUU1p8sdJwXpVytXnTS',
        hdIndex: '6'
      })

      // Mock BCH wallet
      const tempWallet = new BchWallet()
      await tempWallet.walletInfoPromise
      sandbox.stub(tempWallet, 'initialize').resolves()
      sandbox.stub(tempWallet, 'sendAll').resolves('fake-txid')
      sandbox.stub(uut, '_createTempWallet').resolves(tempWallet)

      // Mock the P2WDB library
      uut.Write = class Write {
        async postEntry () { return 'fake-hash' }
      }

      const data = {
        address: 'bitcoincash:qza7sy8jnljkhtt7tgnq5z7f8g7wjgumcyj8rc8duu',
        data: 'fake-data',
        appId: 'fake-appId'
      }

      const result = await uut.addBchEntry(data)
      // console.log('result: ', result)

      assert.equal(result, 'fake-hash')
    })

    it('should throw an error if BCH address is not found in the database', async () => {
      try {
        // Force desired code path
        sandbox.stub(uut.adapters.localdb.BchPayment, 'findOne').resolves(null)

        const data = {
          address: 'bitcoincash:qza7sy8jnljkhtt7tgnq5z7f8g7wjgumcyj8rc8duu',
          data: 'fake-data',
          appId: 'fake-appId'
        }

        await uut.addBchEntry(data)

        assert.fail('Unexpected result')
      } catch (err) {
        assert.include(err.message, 'Payment model not found. Call POST /entry/cost/bch first to get a BCH payment address.')
      }
    })

    it('should throw an error if BCH payment has not been made', async () => {
      try {
        // Force desired code path
        sandbox.stub(uut.adapters.localdb.BchPayment, 'findOne').resolves({
          _id: '63054bb29ebc5f612533845a',
          address: 'bitcoincash:qqy9qhr67mq6fcudvq8vgnzrn798gf3wjyfyhapz59',
          hdIndex: '5',
          timeCreated: '2022-08-23T21:50:42.253Z',
          bchCost: '0.00011073',
          __v: 0,
          remove: async () => {}
        })
        sandbox.stub(uut.adapters.wallet.bchWallet, 'getBalance').resolves(0)

        const data = {
          address: 'bitcoincash:qza7sy8jnljkhtt7tgnq5z7f8g7wjgumcyj8rc8duu',
          data: 'fake-data',
          appId: 'fake-appId'
        }

        await uut.addBchEntry(data)

        assert.fail('Unexpected result')
      } catch (err) {
        assert.include(err.message, 'which is less than the required fee of')
      }
    })

    it('should throw an error issue with database lookup of address', async () => {
      try {
        // Force desired code path
        sandbox.stub(uut.adapters.localdb.BchPayment, 'findOne').resolves({
          _id: '63054bb29ebc5f612533845a',
          address: 'bitcoincash:qqy9qhr67mq6fcudvq8vgnzrn798gf3wjyfyhapz59',
          hdIndex: '5',
          timeCreated: '2022-08-23T21:50:42.253Z',
          bchCost: '0.00011073',
          __v: 0,
          remove: async () => {}
        })
        sandbox.stub(uut.adapters.wallet.bchWallet, 'getBalance').resolves(11073)
        sandbox.stub(uut.adapters.wallet, 'getKeyPair').resolves({
          cashAddress: 'bad-address',
          wif: 'L2WXayLcTiX6GoZ9Mk5tPNRDVcmYhFP5KMUU1p8sdJwXpVytXnTS',
          hdIndex: '6'
        })

        const data = {
          address: 'bitcoincash:qza7sy8jnljkhtt7tgnq5z7f8g7wjgumcyj8rc8duu',
          data: 'fake-data',
          appId: 'fake-appId'
        }

        await uut.addBchEntry(data)

        assert.fail('Unexpected result')
      } catch (err) {
        assert.include(err.message, 'Unexpected error: HD index')
      }
    })
  })

  describe('#_createTempWallet', () => {
    it('should create a wallet given a WIF', async () => {
      const wif = 'L2WXayLcTiX6GoZ9Mk5tPNRDVcmYhFP5KMUU1p8sdJwXpVytXnTS'

      const result = await uut._createTempWallet(wif)
      // console.log('result: ', result)

      assert.equal(result.walletInfo.privateKey, wif)
    })
  })
})
