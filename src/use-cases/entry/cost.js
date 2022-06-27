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
    // The getPsfCost() function is called at startup, so rather than calling
    // it again, just retrieve the stored (current) rate.
    const psfCost = this.adapters.writePrice.currentRate

    return psfCost
  }

  // Get the write cost for a target date.
  async getPsfCostTarget (targetDate) {
    const psfCost = await this.adapters.writePrice.getTargetCostPsf(targetDate)

    return psfCost
  }
}

module.exports = Cost
