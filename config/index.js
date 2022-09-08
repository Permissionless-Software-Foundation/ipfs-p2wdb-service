import common from './env/common.js'

import development from './env/development.js'
import production from './env/production.js'
import test from './env/test.js'

const env = process.env.P2W_ENV || 'development'

let config = development
if (env === 'test') {
  config = test
} else if (env === 'production') {
  config = production
}

// const importStr = `./env/${env}.js`
// console.log('importStr: ', importStr)
// import config from importStr

export default Object.assign({}, common, config)
