# Next Steps

This document will be updated frequently to list out the next major milestones and development goals for this project.

## Short Term

- A utility tool script needs to be developed that can migrate data from an old DB to a new DB.
- A read-all endpoint exists, but a read by hash endpoint needs to be developed.
- Add webhook functionality:
  - A webhook would be set up via REST API or JSON RPC command.
  - A webhook is triggered by the 'replicate' event of OrbitDB.
  - It should be possible to set up a filter so that only specific types of new entries would trigger the webhook.

## Long Term

- Create on-chain read and write endpoints for the BCH blockchain.
- Develop and interface [bch-ipfs-service](https://github.com/christroutner/bch-ipfs-service) so that this database isn't so dependent on FullStack.cash, and blockchain interaction can be done by any service provider.
- Add proof-of-burn interaction for the eCash blockchain.
- Add on-chain interface for read and write for the eCash blockchain.
- Add proof-of-burn interaction for the Avalanche blockchain.
- Add on-chain interface for read and write for the Avalanche blockchain.
- Create a cross-chain database that subscribes to blockchain-specific databases and merges entries from them into a master database.
- Add on-chain interfaces for the master database to each of the blockchain-specific interfaces.
