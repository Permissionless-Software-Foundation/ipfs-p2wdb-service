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
}

module.exports = P2WDB
