/*
  Unit tests for the config directory
*/

import { assert } from 'chai'

let currentEnv

describe('#config', () => {
  before(() => {
    // Backup the current environment setting.
    currentEnv = process.env.P2W_ENV
  })

  after(() => {
    // Restore the environment setting before starting these tests.
    process.env.P2W_ENV = currentEnv
  })

  it('Should return development environment config by default', async () => {
    process.env.P2W_ENV = 'development'
    const importedConfig = await import('../../../config/index.js?foo=bar3')
    const config = importedConfig.default
    // console.log('config: ', config)

    assert.equal(config.env, 'development')
  })

  it('Should return test environment config', async () => {
    // Hack to dynamically import a library multiple times:
    // https://github.com/denoland/deno/issues/6946

    process.env.P2W_ENV = 'test'

    const importedConfig2 = await import('../../../config/index.js?foo=bar1')
    const config = importedConfig2.default
    // console.log('config: ', config)

    assert.equal(config.env, 'test')
  })

  it('Should return prod environment config', async () => {
    process.env.P2W_ENV = 'production'

    const importedConfig3 = await import('../../../config/index.js?foo=bar2')
    const config = importedConfig3.default
    // console.log('config: ', config)

    assert.equal(config.env, 'production')
  })
})
