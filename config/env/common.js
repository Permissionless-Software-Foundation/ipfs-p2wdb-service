
// Hack to get __dirname back.
// https://blog.logrocket.com/alternatives-dirname-node-js-es-modules/
import * as url from 'url'

// Get the version from the package.json file.
import { readFileSync } from 'fs'
const __dirname = url.fileURLToPath(new URL('.', import.meta.url))
const pkgInfo = JSON.parse(readFileSync(`${__dirname.toString()}/../../package.json`))
const version = pkgInfo.version

const ipfsCoordName = process.env.COORD_NAME
  ? process.env.COORD_NAME
  : 'ipfs-p2wdb-service-generic'

const config = {
  // Configure TCP port.
  port: process.env.PORT || 5667,
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
  getJwtAtStartup: !!process.env.GET_JWT_AT_STARTUP,
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
  authPass: process.env.FULLSTACK_AUTH_PASS
    ? process.env.FULLSTACK_AUTH_PASS
    : '',
  useFullStackCash: !!process.env.USE_FULLSTACKCASH,

  // ipfs-bch-wallet-consumer URL
  consumerUrl: process.env.CONSUMER_URL
    ? process.env.CONSUMER_URL
    : 'https://free-bch.fullstack.cash',

  // IPFS settings.
  useIpfs: !process.env.DISABLE_IPFS, // Disable IPFS flag
  isCircuitRelay: !!process.env.ENABLE_CIRCUIT_RELAY,
  // SSL domain used for websocket connection via browsers.
  crDomain: process.env.CR_DOMAIN ? process.env.CR_DOMAIN : '',

  // Information passed to other IPFS peers about this node.
  apiInfo: 'https://ipfs-service-provider.fullstack.cash/',

  // P2W DB OrbitDB name.
  orbitDbName: process.env.ORBITDB_NAME
    ? process.env.ORBITDB_NAME
    // : 'psf-bch-p2wdb-keyvalue-v3.0.0-0001', // Start a new database
    // : '/orbitdb/zdpuAqNiwLiJBfbRK7uihV2hAbNSXj78ufzv5VyQb8GuvRwDh/psf-bch-p2wdb-keyvalue-v3.0.0-0001',
    // : '/orbitdb/zdpuAzuW1fXJPGqN3xx7NB5WJ33Ye7nretkK6iyXqiKk7yMPE',
    // : 'psf-bch-p2wdb-keyvalue-v4.0.0-0001',
    // : '',
    // : '/orbitdb/zdpuAxsSm9BNCBchqXXLLqtwkmCcGepzJ96q4AMH8KSdjomtS',
    : '/orbitdb/zdpuAuiV2EdU1b25eFKnmBZMsJX4ivySReMHbwn9AeG8egjyQ',

  // Maximum size of a new database entry.
  maxDataSize: process.env.MAX_DATA_SIZE
    ? parseInt(process.env.MAX_DATA_SIZE)
    : 10000,
  // SLP Token to use for this database.
  tokenId: process.env.TOKEN_ID
    ? process.env.TOKEN_ID
    : '38e97c5d7d3585a2cbf3f9580c82ca33985f9cb0845d4dcce220cb709f9538b0',
  // Quantity of tokens required to burn in order to write to DB. This
  // default value is overwritten by a lookup of the write price set by the
  // PSF Minting Council
  // https://psfoundation.info/governance/minting-council
  // reqTokenQty: process.env.REQ_TOKEN_QTY
  //   ? parseFloat(process.env.REQ_TOKEN_QTY)
  //   : 0.08335233,
  reqTokenQty: 0.08335233,

  // Markup percentage when accepting BCH and doing the PSF token burn on behalf
  // of the user.
  psfTradeMarkup: 0.1,

  // JSON-LD and Schema.org schema with info about this app.
  announceJsonLd: {
    '@context': 'https://schema.org/',
    '@type': 'WebAPI',
    name: ipfsCoordName,
    version,
    protocol: 'p2wdb',
    description: 'This is a PROTOTYPE access point to the PSF pay-to-write database. DB content may be wiped at any moment. Do not depend on this DB for production use! Cost to write to the DB is 0.01 PSF tokens.',
    documentation: 'https://p2wdb.fullstack.cash/',
    provider: {
      '@type': 'Organization',
      name: 'Permissionless Software Foundation',
      url: 'https://PSFoundation.cash'
    }
  },
  // IPFS Ports
  ipfsTcpPort: process.env.IPFS_TCP_PORT ? process.env.IPFS_TCP_PORT : 4001,
  ipfsWsPort: process.env.IPFS_WS_PORT ? process.env.IPFS_WS_PORT : 4003,
  // IPNS hash to get the latest config info.
  // Not currently implemented.
  ipnsConfig: 'QmTtXA18C6sg3ji9zem4wpNyoz9m4UZT85mA2D2jx2gzEk',

  // BCH Mnemonic for generating encryption keys, payment address, and for
  // intialized the default instance of minimal-slp-wallet.
  mnemonic: process.env.MNEMONIC ? process.env.MNEMONIC : '',

  debugLevel: process.env.DEBUG_LEVEL ? parseInt(process.env.DEBUG_LEVEL) : 3,
  // Settings for production, using external go-ipfs node.
  isProduction: process.env.P2W_ENV === 'production',
  ipfsHost: process.env.IPFS_HOST ? process.env.IPFS_HOST : 'localhost',
  ipfsApiPort: process.env.IPFS_API_PORT
    ? parseInt(process.env.IPFS_API_PORT)
    : 5001,

  chatPubSubChan: 'psf-ipfs-chat-001',

  // This can add specific Circuit Relay v2 servers to connect to.
  bootstrapRelays: [
    // v2 Circuit Relay (Token Tiger)
    // '/ip4/137.184.93.145/tcp/8001/p2p/12D3KooWGMEKkdJfyZbwdH9EafZbRTtMn7FnhWPrE4MhRty2763g',

    // v2 Circuit Relay server (FullStack.cash)
    // '/ip4/78.46.129.7/tcp/4001/p2p/12D3KooWFQ11GQ5NubsJGhYZ4X3wrAGimLevxfm6HPExCrMYhpSL'
  ],

  // Enable or disable the pinning service with an environment variable.
  pinEnabled: process.env.ENABLE_PINNING ? !!process.env.ENABLE_PINNING : false,
  maxPinSize: 1000000, // (1MB) Max pinning size in bytes
  enableBchPayment :  !!process.env.ENABLE_BCH_PAYMENT
}
export default config
