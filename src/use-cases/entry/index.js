import AddEntry from './add-entry.js'
import ReadEntry from './read-entry.js'
import Cost from './cost.js'
class EntryUseCases {
  constructor (localConfig = {}) {
    this.adapters = localConfig.adapters
    if (!this.adapters) {
      throw new Error('Instance of adapters must be passed in when instantiating Entry Use Cases library.')
    }
    // Instantiate the use cases.
    // this.addEntry = new AddEntry({
    //   p2wdbAdapter: this.adapters.p2wdb,
    //   entryAdapter: this.adapters.entry
    // })
    this.addEntry = new AddEntry(localConfig)
    this.readEntry = new ReadEntry({ p2wdbAdapter: this.adapters.p2wdb })
    this.cost = new Cost(localConfig)
  }
}
export default EntryUseCases
