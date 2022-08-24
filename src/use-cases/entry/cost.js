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

    // Encapsulate dependencies
    this.BchPaymentModel = this.adapters.localdb.BchPayment
  }

  // Retrieve the current write cost in PSF tokens.
  getPsfCost () {
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

  // This function is called by the entry/cost/bch REST API endpoint. It
  // calculates the cost of a write in terms of BCH (plus convenience fee),
  // it generates a keypair from the HD wallet, and stores all this data
  // as a Mongo bchPayment model. When a user submits a write, the model is
  // used to verify payment before burning PSF and writing the data to the
  // database on behalf of the user.
  async getBchCost () {
    // Calculate the cost of a P2WDB write in terms of BCH.
    const bchCost = await this.adapters.writePrice.getWriteCostInBch()

    // Generate a key pair
    const { cashAddress, hdIndex } = await this.adapters.wallet.getKeyPair()
    const address = cashAddress

    // Create a time stamp.
    const now = new Date()
    const timeCreated = now.toISOString()

    // Create a new database model to save this data.
    const dbObj = {
      address,
      hdIndex,
      timeCreated,
      bchCost
    }
    const bchPaymentModel = new this.BchPaymentModel(dbObj)
    await bchPaymentModel.save()

    // Return the payment data to the user.
    return { bchCost, address }
  }
}

module.exports = Cost
