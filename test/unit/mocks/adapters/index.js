import BchWallet from "minimal-slp-wallet";

async function* asyncGenerator1() {
  yield 'Hello';
  yield 'World';
}

class IpfsAdapter {
    constructor() {
        this.ipfs = {
            files: {
                stat: () => { }
            },
            pins: {
              add: async () => {},
              rm: async () => {}
            },
            fs: {
              addFile: async () => {},
              stat: async () => {},
              cat: () => asyncGenerator1()
            },
            blockstore: {
              get: async () => {},
              delete: async () => {}
            }
        };
    }
}

class IpfsCoordAdapter {
  constructor () {
    this.ipfsCoord = {
      adapters: {
        ipfs: {
          connectToPeer: async () => {},
        }
      },
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
    ipfsCoordAdapter: new IpfsCoordAdapter(),
    getStatus: async () => {},
    getPeers: async () => {},
    getRelays: async () => {}
  }
ipfs.ipfs = ipfs.ipfsAdapter.ipfs

const p2wdb = {
    ipfsAdapters: {
        ipfsCoordAdapter: {
            ipfsCoord: {}
        }
    },
    insert: async () => { },
    orbit: {
      validationEvent: {
          on: () => { }
      },
      db: {
        all: async () => {},
        // iterator: async () => asyncGenerator2
        iterator: async () => {}
      },
      p2wCanAppend: {
        lastAppendCall: new Date()
      }
    }
};

const entry = {
    readEntry: {
        readAllEntries: () => { }
    },
    doesEntryExist: async () => { },
    insert: async () => { }
};

const webhook = {
    addWebhook: async () => { },
    deleteWebhook: async () => { },
    injectUseCases: () => {}
};

const localdb = {
    Users: class Users {
        static findById() { }
        static find() { }
        static findOne() {
            return {
                validatePassword: localdb.validatePassword
            };
        }
        async save() {
            return {};
        }
        generateToken() {
            return '123';
        }
        toJSON() {
            return {};
        }
        async remove() {
            return true;
        }
        async validatePassword() {
            return true;
        }
    },
    BchPayment: class BchPayment {
        static findOne() { }
        async save() {
            return {};
        }
    },
    validatePassword: () => {
        return true;
    },
    WritePriceModel: class WritePriceModel {
        static findOne() { }
        async save() {
            return {};
        }
    },
    Tickets: class Tickets {
        static find() { }
        async save() {
            return {};
        }
        async remove() {
            return {}
        }
        static async deleteOne() {
            return {}
        }
    }
};

const writePrice = {
    currentRate: 0.133,
    getTargetCostPsf: () => 0.133,
    getWriteCostInBch: async () => { }
};

const wallet = {
    getKeyPair: async () => { },
    bchWallet: {
        walletInfo: {
            cashAddress: 'bitcoincash:qza7sy8jnljkhtt7tgnq5z7f8g7wjgumcyj8rc8duu'
        },
        getBalance: async () => { }
    },
    BchWallet: BchWallet,
    optimize: async () => { },
    getBalance: async () => { },
    getTokenBalance: async () => { },
    walletInfo: {
      cashAddress: 'bitcoincash:qza7sy8jnljkhtt7tgnq5z7f8g7wjgumcyj8rc8duu'
    }
};

const ticket = {
  instanceTicketWallet: async () => wallet,
  createTicket: async () => {},
}

export default {
    ipfs,
    localdb,
    p2wdb,
    entry,
    webhook,
    writePrice,
    wallet,
    ticket
};
