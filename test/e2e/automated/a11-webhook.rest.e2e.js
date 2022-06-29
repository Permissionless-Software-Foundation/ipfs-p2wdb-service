// e2e test for entry endpoint
const assert = require('chai').assert
const config = require('../../../config')
const axios = require('axios').default

const util = require('util')
util.inspect.defaultOptions = { depth: 1 }

const LOCALHOST = `http://localhost:${config.port}`

describe('#Webhook', () => {
  beforeEach(() => {})

  describe('POST /webhook/ - Create Webhook', () => {
    it('should reject when data is incomplete', async () => {
      try {
        const options = {
          method: 'POST',
          url: `${LOCALHOST}/webhook`,
          data: {}
        }

        await axios(options)

        assert(false, 'Unexpected result')
      } catch (err) {
        // console.log(err)
        assert(err.response.status === 422, 'Error code 422 expected.')
      }
    })

    it('should reject if no url property is provided', async () => {
      try {
        const options = {
          method: 'POST',
          url: `${LOCALHOST}/webhook`,
          data: {}
        }
        await axios(options)

        assert(false, 'Unexpected result')
      } catch (err) {
        // console.log('err', err)
        assert.equal(err.response.status, 422)
        assert.include(err.response.data, 'url for webhook must be a string.')
      }
    })

    it('should reject if no appId property is provided', async () => {
      try {
        const options = {
          method: 'POST',
          url: `${LOCALHOST}/webhook`,
          data: {
            url: 'http://mywebhook.com'
          }
        }
        await axios(options)

        assert(false, 'Unexpected result')
      } catch (err) {
        // console.log('err', err)
        assert.equal(err.response.status, 422)
        assert.include(err.response.data, 'appId for webhook must be a string.')
      }
    })

    it('should create webhook', async () => {
      try {
        const options = {
          method: 'POST',
          url: `${LOCALHOST}/webhook`,
          data: {
            url: 'http://mywebhook.com',
            appId: 'e2eTest'
          }
        }
        const result = await axios(options)

        assert(result.status === 200, 'Status Code 200 expected.')
        assert.isTrue(result.data.success)
        assert.isString(result.data.id)
      } catch (err) {
        console.log(err)
        assert.fail('unexpected code path')
      }
    })
  })
  describe('DELETE /webhook', () => {
    it('should reject when data is incomplete', async () => {
      try {
        const options = {
          method: 'DELETE',
          url: `${LOCALHOST}/webhook`,
          data: {}
        }

        await axios(options)

        assert(false, 'Unexpected result')
      } catch (err) {
        assert(err.response.status === 422, 'Error code 422 expected.')
      }
    })

    it('should reject if no url property is provided', async () => {
      try {
        const options = {
          method: 'DELETE',
          url: `${LOCALHOST}/webhook`,
          data: {}
        }
        await axios(options)

        assert(false, 'Unexpected result')
      } catch (err) {
        assert.equal(err.response.status, 422)
        assert.include(err.response.data, 'url for webhook must be a string.')
      }
    })

    it('should reject if no appId property is provided', async () => {
      try {
        const options = {
          method: 'DELETE',
          url: `${LOCALHOST}/webhook`,
          data: {
            url: 'http://mywebhook.com'
          }
        }
        await axios(options)

        assert(false, 'Unexpected result')
      } catch (err) {
        // console.log('err', err)
        assert.equal(err.response.status, 422)
        assert.include(err.response.data, 'appId for webhook must be a string.')
      }
    })
    it('should return false if url or appid does not match', async () => {
      const options = {
        method: 'DELETE',
        url: `${LOCALHOST}/webhook`,
        data: {
          url: 'http://mywebhook2.com',
          appId: 'e2eTest2'
        }
      }
      const result = await axios(options)

      // console.log(`result: ${util.inspect(result.data.success)}`)

      assert.equal(result.data.success, false)
    })
    it('should delete webhook', async () => {
      const options = {
        method: 'DELETE',
        url: `${LOCALHOST}/webhook`,
        data: {
          url: 'http://mywebhook.com',
          appId: 'e2eTest'
        }
      }
      const result = await axios(options)
      // console.log(`result: ${util.inspect(result.data.success)}`)

      assert.equal(result.data.success, true)
    })
  })
})
