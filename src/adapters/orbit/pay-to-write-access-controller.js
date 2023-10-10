/*
  This custom Access Controller library is forked from the ipfs access controller
  that ships with OrbitDB. The canApped() function is adapted to work
  with proof-of-burn.
*/

/**
 * @namespace AccessControllers-PayToWrite
 * @memberof module:AccessControllers
 */

import * as Block from 'multiformats/block'
import * as dagCbor from '@ipld/dag-cbor'
import { sha256 } from 'multiformats/hashes/sha2'
import { base58btc } from 'multiformats/bases/base58'

import { IPFSBlockStorage, LRUStorage, ComposedStorage } from '@chris.troutner/orbitdb-helia/src/storage/index.js'
import pathJoin from '@chris.troutner/orbitdb-helia/src/utils/path-join.js'

const codec = dagCbor
const hasher = sha256
const hashStringEncoding = base58btc

const AccessControlList = async ({ storage, type, params }) => {
  const manifest = {
    type,
    ...params
  }
  const { cid, bytes } = await Block.encode({ value: manifest, codec, hasher })
  const hash = cid.toString(hashStringEncoding)
  await storage.put(hash, bytes)
  return hash
}

const type = 'p2w'

/**
 * Creates an instance of P2WDBAccessController.
 * @callback P2WDBAccessController
 * @param {Object} params Various parameters for configuring the access
 * controller.
 * @param {module:OrbitDB} params.orbitdb An OrbitDB instance.
 * @param {module:Identities} params.identities An Identities instance.
 * @param {string} [params.address] The address of the database.
 * @function
 * @instance
 * @async
 * @memberof module:AccessControllers.AccessControllers-IPFS
 * @private
 */

/**
 * Defines an IPFS access controller.
 * @param {Object} options Various options for configuring the
 * P2WDBAccessController.
 * @param {Array} [params.write] An array of identity ids who can write to the
 * database.
 * @param {module:Storage} [params.storage] An instance of a compatible storage.
 * @return {module:AccessControllers.AccessControllers-IPFS} An
 * P2WDBAccessController function.
 * @memberof module:AccessControllers
 */
const P2WDBAccessController = ({ write, storage } = {}) => async ({ orbitdb, identities, address }) => {
  storage = storage || await ComposedStorage(
    await LRUStorage({ size: 1000 }),
    await IPFSBlockStorage({ ipfs: orbitdb.ipfs, pin: true })
  )
  write = write || [orbitdb.identity.id]

  if (address) {
    // Remove the /p2w/ prefix, as it causes an error.
    // console.log('address 1: ', address)
    address = address.replaceAll('/p2w/', '')
    // console.log('address 2: ', address)

    const manifestBytes = await storage.get(address.replaceAll('/ipfs/', ''))
    const { value } = await Block.decode({ bytes: manifestBytes, codec, hasher })
    write = value.write
  } else {
    address = await AccessControlList({ storage, type, params: { write } })
    address = pathJoin('/', type, address)
  }

  /**
   * Verifies the write permission of an entry.
   * @param {module:Log~Entry} entry An entry to verify.
   * @return {boolean} True if the entry's identity has write permission,
   * false otherwise.
   * @memberof module:AccessControllers.AccessControllers-IPFS
   */
  const canAppend = async (entry) => {
    const writerIdentity = await identities.getIdentity(entry.identity)
    if (!writerIdentity) {
      return false
    }
    const { id } = writerIdentity
    // Allow if the write access list contain the writer's id or is '*'
    if (write.includes(id) || write.includes('*')) {
      // Check that the identity is valid
      return identities.verifyIdentity(writerIdentity)
    }
    return false
  }

  return {
    type,
    address,
    write,
    canAppend
  }
}

P2WDBAccessController.type = type

export default P2WDBAccessController
