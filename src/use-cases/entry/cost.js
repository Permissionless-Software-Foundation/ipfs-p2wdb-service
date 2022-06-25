/*
  Use-Case library for retrieving the write cost of an entry.
*/

class Cost {
  constructor (localConfig = {}) {
    this.adapters = localConfig.adapters
    if (!this.adapters) {
      throw new Error(
        'Instance of adapters must be passed in when instantiating Cost Use Cases library.'
      )
    }
  }

  // Retrieve the current write cost in PSF tokens.
  async getPsfCost () {
    const psfCost = await this.adapters.writePrice.currentRate

    return psfCost
  }
}

module.exports = Cost
