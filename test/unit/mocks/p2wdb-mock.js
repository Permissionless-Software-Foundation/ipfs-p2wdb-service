/*
  Mocks for the p2wdb Adapter library, used by tests for Use Cases
*/
class P2WDB {
    async start() {
        return {};
    }
    async insert() {
        return {};
    }
    async readAll() {
        return { key: 'value' };
    }
    async readByHash() {
        return { data: 'some data' };
    }
    async readByTxid() {
        return { data: 'some data' };
    }
    async readByAppId() {
        return { data: 'some data' };
    }

    async createTicket() {
        return { 
            txid: 'fake-txid',
            signature: 'fake-signature',
            message: 'fake-message',
            timestamp: 'fake-timestamp',
            localTimeStamp: 'fake-localTimeStamp'
        };
    }
}
export default P2WDB;
