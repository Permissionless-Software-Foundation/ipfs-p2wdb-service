/*
  Mocks for the p2wdb Adapter library, used by tests for Use Cases
*/

class P2WDB {
  async start () {
    return {}
  }

  async insert () {
    return {}
  }

  async readAll () {
    return { key: 'value' }
  }

  async readByHash () {
    return { data: 'some data' }
  }

  async readByTxid () {
    return { data: 'some data' }
  }

  async readByAppId () {
    return { data: 'some data' }
  }
}

module.exports = P2WDB
