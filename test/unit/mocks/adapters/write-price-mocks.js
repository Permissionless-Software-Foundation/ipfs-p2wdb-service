/*
  Mock data for the write-price-unit.js unit tests.
*/

const mockTokenData01 = {
  genesisData: {
    type: 1,
    ticker: 'P2WDB',
    name: 'P2WDB PSF Price',
    tokenId: '0ac28ff1e1fa93bf734430fd151115959307cf872c6d130b308a6d29182991d8',
    documentUri: 'ipfs://bafybeidmxb6au63p6t7wxglks3t6rxgt6t26f3gx26ezamenznkjdnwqta',
    documentHash: '6eaa12d2749cf15b00873551088975dd6748d9a6f867426db914735c58ad730a',
    decimals: 0,
    mintBatonIsActive: false,
    tokensInCirculationBN: '1',
    tokensInCirculationStr: '1',
    blockCreated: 745380,
    totalBurned: '0',
    totalMinted: '1'
  },
  immutableData: 'ipfs://bafybeidmxb6au63p6t7wxglks3t6rxgt6t26f3gx26ezamenznkjdnwqta',
  mutableData: 'ipfs://bafybeiavsmo4crwvhe6vas7e5tiecsgj7yblueqdbcoeb335js3zgi7reu'
}

const mutableData01 = {
  tokenIcon: 'https://psfoundation.cash/static/psf-logo-32a2c411985bbbf299687b06c3224384.png',
  about: 'This token is used to set the price in PSF tokens to write to P2WDB. The goal is to target $0.01 per write. This data is updated periodically to adjust to the spot price of BCH and PSF tokens.',
  p2wdbPriceHistory: [
    {
      date: '06/24/2022',
      psfPerWrite: 0.133
    },
    {
      date: '06/20/2022',
      psfPerWrite: 0.126
    }
  ]
}

const mockPriceHistory01 = [
  {
    date: '06/24/2022',
    psfPerWrite: 0.133
  },
  {
    date: '06/20/2022',
    psfPerWrite: 0.126
  }
]

module.exports = {
  mockTokenData01,
  mutableData01,
  mockPriceHistory01
}
