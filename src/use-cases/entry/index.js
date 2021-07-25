/*
  Use Case library for the Entry Entity.
  This library controlls all the verbs/actions/use-cases that can be performed
  on or by the Entry Entity.
*/

// Individual Use Case libraries
const AddEntry = require('./add-entry')
const ReadEntry = require('./read-entry')

class EntryUseCases {
  constructor (localConfig = {}) {
    this.adapters = localConfig.adapters
    if (!this.adapters) {
      throw new Error(
        'Instance of adapters must be passed in when instantiating Entry Use Cases library.'
      )
    }

    // Instantiate the use cases.
    this.addEntry = new AddEntry({
      p2wdbAdapter: this.adapters.p2wdb,
      entryAdapter: this.adapters.entry
    })

    this.readEntry = new ReadEntry({ p2wdbAdapter: this.adapters.p2wdb })
  }
}

module.exports = EntryUseCases
