/*
  Unit tests for P2W Access Controller.
  This file is copied and adapted from the OrbitDB project. This file:
  orbitdb/test/access-controllers/ipfs-access-controller.test.js
*/

// Global npm libraries
import { strictEqual, deepStrictEqual, notStrictEqual } from 'assert'
import { rimraf } from 'rimraf'
import Keystore from '@chris.troutner/orbitdb-helia/src/key-store.js'
import Identities from '@chris.troutner/orbitdb-helia/src/identities/identities.js'
// import config from '@chris.troutner/orbitdb-helia/test/config.js'
import config from './util/config.js'
import connectPeers from './util/connect-nodes.js'
import createHelia from './util/create-helia.js'

// Local libraries
import P2WDBAccessController from '../../../../src/adapters/orbit/pay-to-write-access-controller.js'

describe('P2WDBAccessController', function () {
  const dbPath1 = './orbitdb/tests/ipfs-access-controller/1'
  const dbPath2 = './orbitdb/tests/ipfs-access-controller/2'

  this.timeout(config.timeout)

  let ipfs1, ipfs2
  let keystore1, keystore2
  // let identities1, identities2
  let identities1
  // let testIdentity1, testIdentity2
  let testIdentity1
  // let orbitdb1, orbitdb2
  let orbitdb1

  before(async () => {
    [ipfs1, ipfs2] = await Promise.all([createHelia(), createHelia()])
    await connectPeers(ipfs1, ipfs2)

    keystore1 = await Keystore({ path: dbPath1 + '/keys' })
    keystore2 = await Keystore({ path: dbPath2 + '/keys' })

    identities1 = await Identities({ keystore: keystore1 })
    // identities2 = await Identities({ keystore: keystore2 })

    testIdentity1 = await identities1.createIdentity({ id: 'userA' })
    // testIdentity2 = await identities2.createIdentity({ id: 'userB' })

    orbitdb1 = { ipfs: ipfs1, identity: testIdentity1 }
    // orbitdb2 = { ipfs: ipfs2, identity: testIdentity2 }
  })

  after(async () => {
    if (ipfs1) {
      await ipfs1.stop()
    }

    if (ipfs2) {
      await ipfs2.stop()
    }

    if (keystore1) {
      await keystore1.close()
    }

    if (keystore2) {
      await keystore2.close()
    }

    await rimraf('./orbitdb')
    await rimraf('./ipfs1')
    await rimraf('./ipfs2')
  })

  let accessController

  describe('Default write access', () => {
    before(async () => {
      accessController = await P2WDBAccessController()({
        orbitdb: orbitdb1,
        identities: identities1
      })
    })

    it('creates an access controller', () => {
      notStrictEqual(accessController, null)
      notStrictEqual(accessController, undefined)
    })

    it('sets the controller type', () => {
      strictEqual(accessController.type, 'p2w')
    })

    it('sets default write', async () => {
      deepStrictEqual(accessController.write, [testIdentity1.id])
    })

    // Dev Note: These tests are left here for reference. These were specific
    // to the IPFS access controller and do not apply to the P2W access controller.

    // it('user with write access can append', async () => {
    //   const mockEntry = {
    //     identity: testIdentity1.hash,
    //     v: 1
    //   // ...
    //   // doesn't matter what we put here, only identity is used for the check
    //   }
    //   const canAppend = await accessController.canAppend(mockEntry)
    //   strictEqual(canAppend, true)
    // })

    // it('user without write cannot append', async () => {
    //   const mockEntry = {
    //     identity: testIdentity2.hash,
    //     v: 1
    //   // ...
    //   // doesn't matter what we put here, only identity is used for the check
    //   }
    //   const canAppend = await accessController.canAppend(mockEntry)
    //   strictEqual(canAppend, false)
    // })

    // This test could be restored. It was causing timeouts in tests on Jenkins CI.
    // it('replicates the access controller', async () => {
    //   const replicatedAccessController = await P2WDBAccessController()({
    //     orbitdb: orbitdb2,
    //     identities: identities2,
    //     address: accessController.address
    //   })
    //
    //   strictEqual(replicatedAccessController.type, accessController.type)
    //   // strictEqual(replicatedAccessController.address, accessController.address)
    //   deepStrictEqual(replicatedAccessController.write, accessController.write)
    // })
  })

  describe('Write all access', () => {
    before(async () => {
      accessController = await P2WDBAccessController({ write: ['*'] })({
        orbitdb: orbitdb1,
        identities: identities1
      })
    })

    it('sets write to \'Anyone\'', async () => {
      deepStrictEqual(accessController.write, ['*'])
    })
  })

  describe('#canAppend', () => {
    it('should return true if canAppend function returns true', async () => {
      // Generate a mock canAppend() function and inject it into the access
      // controller library.
      const canAppendMock = {
        canAppend: async () => true
      }
      P2WDBAccessController.injectDeps(canAppendMock)

      // Create an instance of the Access Controller for this test.
      const localAccessController = await P2WDBAccessController()({
        orbitdb: orbitdb1,
        identities: identities1
      })

      const result = await localAccessController.canAppend({})

      strictEqual(result, true)
    })

    it('should return false if canAppend function returns false', async () => {
      // Generate a mock canAppend() function and inject it into the access
      // controller library.
      const canAppendMock = {
        canAppend: async () => false
      }
      P2WDBAccessController.injectDeps(canAppendMock)

      // Create an instance of the Access Controller for this test.
      const localAccessController = await P2WDBAccessController()({
        orbitdb: orbitdb1,
        identities: identities1
      })

      const result = await localAccessController.canAppend({})

      strictEqual(result, false)
    })
  })
})
