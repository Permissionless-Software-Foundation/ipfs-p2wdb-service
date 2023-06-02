import common from './env/common.js'

import development from './env/development.js'
import production from './env/production.js'
import test from './env/test.js'

const env = process.env.P2W_ENV || 'development'
console.log(`Loading config for this environment: ${env}`)

let config = development
if (env === 'test') {
  config = test
} else if (env === 'production') {
  config = production
}

config.env = env

export default Object.assign({}, common, config)
