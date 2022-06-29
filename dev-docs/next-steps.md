# Next Steps

This document will be updated frequently to list out the next major milestones and development goals for this project.

## Short Term

- Add a wallet feature that is turned on with an environment variable.
  - The P2WDB has it's own wallet that holds BCH and PSF tokens.
  - Add a REST API endpoint that lets someone pay in BCH, and the P2WDB will pay with its own PSF tokens.

## Long Term

- Create on-chain read and write endpoints for the BCH blockchain.
- Add proof-of-burn interaction for the eCash blockchain.
- Add on-chain interface for read and write for the eCash blockchain.
- Add proof-of-burn interaction for the Avalanche blockchain.
- Add on-chain interface for read and write for the Avalanche blockchain.
- Create a cross-chain database that subscribes to blockchain-specific databases and merges entries from them into a master database.
- Add on-chain interfaces for the master database to each of the blockchain-specific interfaces.

## Completed Milestones

- A utility tool script needs to be developed that easily backup data in the DB.
- A read-all endpoint exists, but a read by hash endpoint needs to be developed.
- Add webhook functionality:
  - A webhook would be set up via REST API or JSON RPC command.
  - A webhook is triggered by the 'replicate' event of OrbitDB.
  - It should be possible to set up a filter so that only specific types of new entries would trigger the webhook.
- Develop an interface for [minimal-slp-wallet](https://www.npmjs.com/package/minimal-slp-wallet) so that this database isn't so dependent on FullStack.cash, and blockchain interaction can be done by any service provider.
