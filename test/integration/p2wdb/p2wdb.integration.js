/*
  Integration tests for the P2WDB access controller.

  This file attempts to increase code coverage by accessing properties of the
  P2WDB Access Controller Library (ACL) that are more properly covered by
  the OrbitDB repository.
*/

const BCHJS = require('@psf/bch-js')
const bchjs = new BCHJS()
// const IpfsCoord = require('ipfs-coord')
const IPFS = require('ipfs')
const assert = require('chai').assert

const OrbitDBAdapter = require('../../../src/adapters/orbit')

describe('#P2WDB-integration', () => {
  let ipfs
  let uut
  let db

  before(async () => {
    try {
      const ipfsOptions = {
        repo: './.ipfsdata'
      }

      // Start the IPFS node.
      ipfs = await IPFS.create(ipfsOptions)
      await ipfs.config.profiles.apply('server')

      // Create a P2WDB
      uut = new OrbitDBAdapter({ ipfs })
      db = await uut.createDb({ dbName: 'test001', bchjs })
    } catch (err) {
      console.error('Error in before(): ', err)
      throw err
    }
  })

  // beforeEach(async () => {
  //
  // })

  after(async () => {
    await db.access.close()
  })

  describe('#capabilities', () => {
    it('should get OrbitDB capabilities', () => {
      const result = db.access.capabilities
      // console.log('result: ', result)

      assert.property(result, 'write')
      assert.property(result, 'admin')
    })

    it('should return an empty object if _db is false', () => {
      // Backup the db.
      const tempDb = db.access._db

      // Overwrite _db
      db.access._db = false

      const result = db.access.capabilities
      // console.log('result: ', result)

      // Restore the original DB.
      db.access._db = tempDb

      assert.isObject(result)
    })
  })

  describe('#address', () => {
    it('should get OrbitDB address', async () => {
      const result = db.access.address
      // console.log('result: ', result)

      assert.property(result, 'root')
      assert.property(result, 'path')
    })
  })

  describe('#get', () => {
    it('should get OrbitDB write capability', () => {
      const result = db.access.get('write')
      // console.log('result: ', result)

      const result2 = result.has('*')
      // console.log('result2: ', result2)

      assert.equal(result2, true)
    })
  })

  describe('#revoke', () => {
    it('should revoke access', async () => {
      await db.access.revoke('write', '*')
      // console.log('result: ', result)

      assert.isOk('Not throwing an error is a pass')
    })

    it('should leave unrevoked properties', async () => {
      await db.access.revoke('admin', 'test')
      // console.log('result: ', result)

      assert.isOk('Not throwing an error is a pass')
    })
  })
})
