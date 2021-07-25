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
}

module.exports = ReadEntry
