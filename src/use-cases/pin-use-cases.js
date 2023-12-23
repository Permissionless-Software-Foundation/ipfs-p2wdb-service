/*
  This is a use-case library for the pinning service. This library contains
  the business logic for pinning files. This library is primarily called by the
  the REST API controller.
*/

// Global npm libraries
import axios from 'axios'
import RetryQueue from '@chris.troutner/retry-queue'
import { CID } from 'multiformats'

// Local libraries
import config from '../../config/index.js'

class PinUseCases {
  constructor (localConfig = {}) {
    // console.log('User localConfig: ', localConfig)

    // Dependency injection
    this.adapters = localConfig.adapters
    if (!this.adapters) {
      throw new Error(
        'Instance of adapters must be passed in when instantiating Pin Use Cases library.'
      )
    }
    this.entryUseCases = localConfig.entryUseCases
    if (!this.entryUseCases) {
      throw new Error(
        'Instance of entry Use Cases must be passed in when instantiating Pin Use Case library.'
      )
    }

    // Encapsulate dependencies
    this.axios = axios
    this.retryQueue = new RetryQueue()
    this.config = config

    // State
    this.pinTimeoutPeriod = 60000

    // Bind 'this' object to functions that lose context.
    this.getJsonFromP2wdb = this.getJsonFromP2wdb.bind(this)
    this.pinCid = this.pinCid.bind(this)
    this.pinJson = this.pinJson.bind(this)
    this.validateCid = this.validateCid.bind(this)
    this._getCid = this._getCid.bind(this)
    this.pinTimer = this.pinTimer.bind(this)
    this.pinCidWithTimeout = this.pinCidWithTimeout.bind(this)
  }

  // Given a CID, pin it with the IPFS node attached to this app.
  async pinCid (cid) {
    // CT 5/26/23: The validation process (of checking the files size) can
    // take an extremely long time to complete. This function was heavily
    // refactored to take this into account. The file is assumed valid and
    // pinned, and then unpinned if it fails validation.

    try {
      console.log(`Attempting to pinning CID: ${cid}`)

      // Get the file so that we have it locally.
      console.log(`Getting file ${cid}`)

      const cidClass = CID.parse(cid)
      console.log('cidClass: ', cidClass)

      let now = new Date()
      console.log(`Starting download of ${cid} at ${now.toISOString()}`)

      let fileSize = null

      const file = await this.retryQueue.addToQueue(this._getCid, { cid: cidClass })
      // const file = await this.adapters.ipfs.ipfs.blockstore.get(cidClass)
      fileSize = file.length
      console.log(`CID ${cid} is ${fileSize} bytes big.`)

      now = new Date()
      console.log(`Finished download of ${cid} at ${now.toISOString()}`)

      // Verify the CID meets requirements for pinning.
      const isValid = await this.validateCid({ cid: cidClass, fileSize })

      if (isValid) {
        // Pin the file
        await this.adapters.ipfs.ipfs.pins.add(cidClass)
        console.log(`Pinned file ${cid}`)
      } else {
        // If the file does meet the size requirements, then unpin it.
        console.log(`File ${cid} is bigger than max size of ${this.config.maxPinSize} bytes. Unpinning file.`)

        // Delete the file from the blockstore
        await this.adapters.ipfs.ipfs.blockstore.delete(cidClass)

        return false
      }

      return true
    } catch (err) {
      console.error('Error in pinCid(): ', err)
      throw err
    }
  }

  // Returns a promise that resolves after a period of time. This can be used
  // to abort a pin attempt so that the process can move on to other pinning
  // candidates, and not be blocked by a pin that can't resolve.
  pinTimer () {
    return new Promise(resolve => setTimeout(resolve(false), this.pinTimeoutPeriod))
  }

  // Attempts to pin a CID, but will exit if the pinning takes too long.
  async pinCidWithTimeout (cid) {
    const raceVal = await Promise.race([
      this.pinCid(cid),
      this.pinTimer()
    ])
    console.log('raceVal: ', raceVal)

    if (!raceVal) {
      console.log(`Could not get content behind CID ${cid}. Download timed out.`)
    } else {
      console.log(`Successfully pinned CID ${cid}`)
    }

    return raceVal
  }

  // This function wraps the IPFS get() function so that it can be called by
  // the retry queue.
  async _getCid (inObj = {}) {
    const { cid } = inObj

    try {
      const file = await this.adapters.ipfs.ipfs.blockstore.get(cid)
      return file
    } catch (err) {
      console.error('Error in _getCid(): ', err)
      throw err
    }
  }

  // Given a zcid (P2WDB hash), retrieve the JSON in that entry, convert it to
  // a file, and pin it with the IPFS node.
  async pinJson (zcid) {
    try {
      console.log('pinJson will pin the content in this P2WDB entry: ', zcid)

      // Get the entry from the P2WDB. Automatically retry if it fails.
      // const data = await this.retryQueue.addToQueue(this.getJsonFromP2wdb, { zcid })
      const data = await this.getJsonFromP2wdb({ zcid })
      console.log('data: ', data)

      // Convert the data from a string to JSON
      let entry2
      try {
        entry2 = JSON.parse(data)
        console.log('entry2: ', entry2)
      } catch (err) {
        throw new Error('Could not parse P2WDB entry into a JSON object.')
      }

      // Isolate the raw data
      const rawData = entry2.data
      console.log('rawData: ', rawData)

      const encoder = new TextEncoder()
      const bytes = encoder.encode(JSON.stringify(rawData))

      // Create a FileObject
      // https://github.com/ipfs/js-ipfs/blob/master/docs/core-api/FILES.md#ipfsadddata-options
      const file = {
        path: '/data.json',
        content: bytes
      }

      const addOptions = {
        cidVersion: 1,
        wrapWithDirectory: true
      }

      // console.log('this.adapters.ipfs.ipfs: ', this.adapters.ipfs.ipfs)

      // Add the file to IPFS.
      const ipfsResult = await this.adapters.ipfs.ipfs.fs.addFile(file, addOptions)
      console.log('ipfsResult: ', ipfsResult)

      // Pin the file to this IPFS node.
      const result2 = await this.adapters.ipfs.ipfs.pins.add(ipfsResult)
      console.log('result2: ', result2)

      const cid = ipfsResult.toString()

      return cid
    } catch (err) {
      console.error('Error in pinJson()')
      throw err
    }
  }

  // A promise-based function for retrieving the data that was just written
  // to the P2WDB. This function is loaded into the Retry Queue, so that it
  // is automatically retried until it succeeds.
  async getJsonFromP2wdb (inObj) {
    // Exract the input arguments from the input object.
    const { zcid } = inObj

    const p2wdbData = await this.entryUseCases.readEntry.readByHash(zcid)

    const jsonData = p2wdbData.value.data
    console.log('getJsonFromP2wdb() jsonData: ', jsonData)

    return jsonData
  }

  // Validate the CID by ensuring it meets the requirements for pinning.
  async validateCid (inObj = {}) {
    const { cid, fileSize } = inObj

    if (!fileSize) throw new Error(`${cid} has indeterminate file size.`)

    console.log(`CID is ${fileSize} bytes is size.`)

    if (fileSize < this.config.maxPinSize) {
      return true
    }

    return false
  }
}

export default PinUseCases
