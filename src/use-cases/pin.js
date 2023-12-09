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

    // Bind 'this' object to functions that lose context.
    this.getJsonFromP2wdb = this.getJsonFromP2wdb.bind(this)
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
      const fs = this.adapters.ipfs.ipfs.fs
      const test = fs.cat(cid)
      console.log('test: ', test)
      for await (const buf of fs.cat(cid)) {
        // Make the linter happy.
        const fakeFunc = () => {}
        fakeFunc(buf)
      }
      // await this.adapters.ipfs.ipfs.get(cid)
      console.log('File retrieved.')

      const cidClass = CID.parse(cid)
      console.log('cidClass: ', cidClass)

      // Pin the file (assume valid)
      // await this.adapters.ipfs.ipfs.pin.add(cid)
      await this.adapters.ipfs.ipfs.pins.add(cidClass)
      console.log(`Pinned file ${cid}`)

      // Verify the CID meets requirements for pinning.
      const isValid = await this.validateCid(cidClass)
      if (!isValid) {
        // If the file does meet the size requirements, then unpin it.
        console.log(`File ${cid} is bigger than max size of ${this.config.maxPinSize} bytes. Unpinning file.`)
        await this.adapters.ipfs.ipfs.pins.rm(cidClass)
        return false
      }

      return true
    } catch (err) {
      console.error('Error in pinCid()')
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
  async validateCid (cid) {
    try {
      const now = new Date()
      console.log(`${now.toISOString()}`)

      // Get the filesize of the CID
      const options = {
        size: true
      }
      const fs = this.adapters.ipfs.ipfs.fs
      // const fileStats = await this.adapters.ipfs.ipfs.files.stat(`/ipfs/${cid}`, options)
      const fileStats = await fs.stat(cid, options)
      // console.log('fileStats: ', fileStats)

      /*
      Example input:

      fileStats:  {
        cid: CID(bafybeifmevvmrtpqay6ejrabzw3frljfbbhetk5rfmdhp5eu2urrddvgte),
        mode: 420,
        mtime: undefined,
        fileSize: 51526n,
        dagSize: 51536n,
        localFileSize: 51526n,
        localDagSize: 51540n,
        blocks: 1,
        type: 'file',
        unixfs: UnixFS {
          type: 'file',
          data: <Buffer ff d8 ff e0 00 10 4a 46 49 46 00 01 01 00 00 01 00 01 00 00 ff e2 01 d8 49 43 43 5f 50 52 4f 46 49 4c 45 00 01 01 00 00 01 c8 00 00 00 00 04 30 00 00 ... 51476 more bytes>,
          blockSizes: [],
          hashType: undefined,
          fanout: undefined,
          mtime: undefined,
          _mode: 420,
          _originalMode: 0
        }
      }
      */

      const fileSize = fileStats.fileSize
      console.log(`CID is ${fileSize} bytes is size.`)

      if (fileSize < this.config.maxPinSize) {
        return true
      }

      return false
    } catch (err) {
      console.error('Error in validateCid(): ', err)
      throw err
    }
  }
}

export default PinUseCases
