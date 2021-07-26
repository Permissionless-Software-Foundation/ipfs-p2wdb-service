/*
  A mock for a Mongo database file. Simulates a lot of the commonly used functions.
*/

class MongoModelMock {
  // Static methods of the class.
  static async find () {
    return []
  }

  // Methods available to instances of the class.
  async save () {
    return {}
  }
}

module.exports = MongoModelMock
