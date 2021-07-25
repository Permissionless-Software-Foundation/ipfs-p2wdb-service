/*
  A mocked version of the OrbitDB library.
*/

class OrbitDBMock {
  constructor () {
    this.all = {}
    this.id = 'id'
  }

  async put () {
    return 'hash'
  }

  async load () {
    return 'load'
  }
}
class OrbitDBAdapterMock {
  constructor () {
    this.db = { put: () => { return 'hash' } }
  }

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

module.exports = { OrbitDBMock, OrbitDBAdapterMock }
