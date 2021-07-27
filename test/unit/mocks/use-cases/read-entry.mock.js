/*
  A mock file used for testing of controllers that depend on the read-entry
  use-case.
*/

class ReadEntry {
  async readAllEntries () {
    const data = {
      key1: 'value1',
      key2: 'value2'
    }

    return data
  }

  async readByHash () {
    return {
      data: 'data',
      success: true
    }
  }

  async readByTxid () {
    return {
      data: 'data',
      success: true
    }
  }

  async readByAppId () {
    return {
      data: 'data',
      success: true
    }
  }
}

module.exports = ReadEntry
