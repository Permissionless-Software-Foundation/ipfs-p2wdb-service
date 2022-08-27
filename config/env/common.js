/*
  This file is used to store unsecure, application-specific data common to all
  environments.
*/

/* eslint  no-unneeded-ternary:0 */

// Get the version from the package.json file.
const pkgInfo = require('../../package.json')
const version = pkgInfo.version

const ipfsCoordName = process.env.COORD_NAME
  ? process.env.COORD_NAME
  : 'ipfs-p2wdb-service-generic'

module.exports = {
  // Configure TCP port.
  port: process.env.PORT || 5001,

  // Password for HTML UI that displays logs.
  logPass: 'test',

  // Email server settings if nodemailer email notifications are used.
  emailServer: process.env.EMAILSERVER
    ? process.env.EMAILSERVER
    : 'mail.someserver.com',
  emailUser: process.env.EMAILUSER
    ? process.env.EMAILUSER
    : 'noreply@someserver.com',
  emailPassword: process.env.EMAILPASS
    ? process.env.EMAILPASS
    : 'emailpassword',

  // FullStack.cash account information, used for automatic JWT handling.
  getJwtAtStartup: process.env.GET_JWT_AT_STARTUP ? true : false,
  authServer: process.env.AUTHSERVER
    ? process.env.AUTHSERVER
    : 'https://auth.fullstack.cash',
  apiServer: process.env.APISERVER
    ? process.env.APISERVER
    : 'https://api.fullstack.cash/v5/',
  fullstackLogin: process.env.FULLSTACKLOGIN
    ? process.env.FULLSTACKLOGIN
    : 'demo@demo.com',
  fullstackPassword: process.env.FULLSTACKPASS
    ? process.env.FULLSTACKPASS
    : 'demo',

  // ipfs-bch-wallet-consumer URL
  consumerUrl: process.env.CONSUMER_URL
    ? process.env.CONSUMER_URL
    : 'https://free-bch.fullstack.cash/',

  // IPFS settings.
  isCircuitRelay: process.env.ENABLE_CIRCUIT_RELAY ? true : false,
  // SSL domain used for websocket connection via browsers.
  crDomain: process.env.CR_DOMAIN ? process.env.CR_DOMAIN : '',

  // Information passed to other IPFS peers about this node.
  apiInfo: 'https://ipfs-service-provider.fullstack.cash/',

  // P2W DB OrbitDB name.
  orbitDbName: process.env.ORBITDB_NAME
    ? process.env.ORBITDB_NAME
    // : 'psf-bch-p2wdb-keyvalue-v3.0.0-0001', // Start a new database
    : '/orbitdb/zdpuAqNiwLiJBfbRK7uihV2hAbNSXj78ufzv5VyQb8GuvRwDh/psf-bch-p2wdb-keyvalue-v3.0.0-0001', // Subscribe to an existing database.

  // Maximum size of a new database entry.
  maxDataSize: process.env.MAX_DATA_SIZE
    ? parseInt(process.env.MAX_DATA_SIZE)
    : 10000,

  // SLP Token to use for this database.
  tokenId: process.env.TOKEN_ID
    ? process.env.TOKEN_ID
    : '38e97c5d7d3585a2cbf3f9580c82ca33985f9cb0845d4dcce220cb709f9538b0',

  // Quantity of tokens required to burn in order to write to DB.
  reqTokenQty: process.env.REQ_TOKEN_QTY
    ? parseInt(process.env.REQ_TOKEN_QTY)
    : 0.01,

  // JSON-LD and Schema.org schema with info about this app.
  announceJsonLd: {
    '@context': 'https://schema.org/',
    '@type': 'WebAPI',
    name: ipfsCoordName,
    version,
    protocol: 'p2wdb',
    description:
      'This is a PROTOTYPE access point to the PSF pay-to-write database. DB content may be wiped at any moment. Do not depend on this DB for production use! Cost to write to the DB is 0.01 PSF tokens.',
    documentation: 'https://p2wdb.fullstack.cash/',
    provider: {
      '@type': 'Organization',
      name: 'Permissionless Software Foundation',
      url: 'https://PSFoundation.cash'
    }
  },

  // IPFS Ports
  ipfsTcpPort: process.env.IPFS_TCP_PORT ? process.env.IPFS_TCP_PORT : 5668,
  ipfsWsPort: process.env.IPFS_WS_PORT ? process.env.IPFS_WS_PORT : 5669,

  // IPNS hash to get the latest config info.
  // Not currently implemented.
  ipnsConfig: 'QmTtXA18C6sg3ji9zem4wpNyoz9m4UZT85mA2D2jx2gzEk',

  // BCH Mnemonic for generating encryption keys and payment address
  mnemonic: process.env.MNEMONIC ? process.env.MNEMONIC : '',

  debugLevel: process.env.DEBUG_LEVEL ? parseInt(process.env.DEBUG_LEVEL) : 2,

  // Settings for production, using external go-ipfs node.
  isProduction: process.env.P2W_ENV === 'production' ? true : false,
  ipfsHost: process.env.IPFS_HOST ? process.env.IPFS_HOST : 'localhost',
  ipfsApiPort: process.env.IPFS_API_PORT
    ? parseInt(process.env.IPFS_API_PORT)
    : 5001,

  chatPubSubChan: 'psf-ipfs-chat-001',

  // Markup for providing PSF tokens so user can pay in BCH.
  psfTradeMarkup: 0.1,

  // Turn on pay-in-bch plugin. Disabled by default. Use env var to overwrite.
  enableBchPayment: process.env.ENABLE_BCH_PAYMENT ? process.env.ENABLE_BCH_PAYMENT : false,

  // By default use the web3 Cash Stack from CashStack.info, but can overide to use web2 infra like FullStack.cash
  useFullStackCash: process.env.USE_FULLSTACKCASH ? true : false
}
