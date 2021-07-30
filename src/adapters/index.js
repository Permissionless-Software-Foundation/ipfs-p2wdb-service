/*
  This is a top-level library that encapsulates all the additional Adapters.
  The concept of Adapters comes from Clean Architecture:
  https://troutsblog.com/blog/clean-architecture
*/

// Load individual adapter libraries.
const IPFSAdapter = require('./ipfs')
const LocalDB = require('./localdb')
const LogsAPI = require('./logapi')
const Passport = require('./passport')
const Nodemailer = require('./nodemailer')
const { wlogger } = require('./wlogger')
const JSONFiles = require('./json-files')
const P2WDBAdapter = require('./p2wdb')
const EntryAdapter = require('./entry')
const WebhookAdapter = require('./webhook')
const FullStackJWT = require('./fullstack-jwt')

const config = require('../../config')

// Instantiate adapter libraries.
const ipfs = new IPFSAdapter()
const localdb = new LocalDB()
const logapi = new LogsAPI()
const passport = new Passport()
const nodemailer = new Nodemailer()
const jsonFiles = new JSONFiles()
const p2wdb = new P2WDBAdapter()
const entry = new EntryAdapter()
const webhook = new WebhookAdapter()

// Get a valid JWT API key and instance bch-js.
const fullStackJwt = new FullStackJWT({
  authServer: config.AUTHSERVER,
  apiServer: config.APISERVER,
  login: config.FULLSTACKLOGIN,
  password: config.FULLSTACKPASS
})
const bchjs = {} // Placeholder.

module.exports = {
  ipfs,
  localdb,
  logapi,
  passport,
  nodemailer,
  wlogger,
  jsonFiles,
  p2wdb,
  entry,
  webhook,
  fullStackJwt
}
