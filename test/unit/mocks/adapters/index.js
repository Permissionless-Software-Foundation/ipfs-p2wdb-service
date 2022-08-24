/*
  Mocks for the Adapter library.
*/

const BchWallet = require('minimal-slp-wallet/index')

class IpfsAdapter {
  constructor () {
    this.ipfs = {
      files: {
        stat: () => {}
      }
    }
  }
}

class IpfsCoordAdapter {
  constructor () {
    this.ipfsCoord = {
      useCases: {
        peer: {
          sendPrivateMessage: () => {}
        }
      }
    }
  }
}

const ipfs = {
  ipfsAdapter: new IpfsAdapter(),
  ipfsCoordAdapter: new IpfsCoordAdapter()
}
ipfs.ipfs = ipfs.ipfsAdapter.ipfs

const p2wdb = {
  ipfsAdapters: {
    ipfsCoordAdapter: {
      ipfsCoord: {}
    }
  },
  insert: async () => {},
  orbit: {
    validationEvent: {
      on: () => {}
    }
  }
}

const entry = {
  readEntry: {
    readAllEntries: () => {}
  },
  doesEntryExist: async () => {},
  insert: async () => {}
}

const webhook = {
  addWebhook: async () => {},
  deleteWebhook: async () => {}
}

const localdb = {
  Users: class Users {
    static findById () {}
    static find () {}
    static findOne () {
      return {
        validatePassword: localdb.validatePassword
      }
    }

    async save () {
      return {}
    }

    generateToken () {
      return '123'
    }

    toJSON () {
      return {}
    }

    async remove () {
      return true
    }

    async validatePassword () {
      return true
    }
  },

  BchPayment: class BchPayment {
    static findOne () {}

    async save () {
      return {}
    }
  },

  validatePassword: () => {
    return true
  }
}

const writePrice = {
  currentRate: 0.133,
  getTargetCostPsf: () => 0.133,
  getWriteCostInBch: async () => {}
}

const wallet = {
  getKeyPair: async () => {},

  bchWallet: {
    walletInfo: {
      cashAddress: 'bitcoincash:qza7sy8jnljkhtt7tgnq5z7f8g7wjgumcyj8rc8duu'
    },
    getBalance: async () => {}
  },

  BchWallet: BchWallet
}

module.exports = { ipfs, localdb, p2wdb, entry, webhook, writePrice, wallet }
