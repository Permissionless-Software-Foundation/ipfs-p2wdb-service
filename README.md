# ipfs-p2wdb-service

[![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg)](http://standardjs.com) [![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg)](https://github.com/semantic-release/semantic-release)

## Overview

P2WDB is an acronym for **pay-to-write database**. It's a peer-to-peer (p2p) database that operates over [IPFS](https://ipfs.io), and functions similarly to a blockchain.

This code repository is the 'server' or 'service' side, for operating a P2WDB locally. If you simply want to read or write data to the P2WDB, check out the 'client' JavaScript library: [p2wdb](https://www.npmjs.com/package/p2wdb).

The P2WDB has the advantages of a blockchain:
- There are multiple *nodes* on the network hosting their own copy of the database.
- These *redundant copies* make it very difficult to censor content in the database, and ensure high availability of the data.
- The nodes sync their databases using *consensus rules*.
- Writes are paid for by burning PSF tokens. This provides *incentive* to improve the software and services.

The P2WDB has the advantages of a web-app database:
- Up to 10KB of data can be included per write.
- Reduced size, since P2WDB prunes data over a year old.
- Easy backup of data to Filecoin for long-term storage.
- REST API interface for CRUD (Create, Read, Update, Delete) operations over web2.
- JSON RPC interface for CRUD operations over web3 (IPFS).
- Webhooks for triggering events when application-specific data is written to the P2WDB.

## What Is P2WDB?

- [YouTube Video Overview of the P2WDB Project](https://youtu.be/korI-8W240s)
- [JSON RPC and REST API Documentation](https://p2wdb-docs.fullstack.cash/)

P2WDB is an acronym for pay-to-write database. It's a peer-to-peer (p2p) database that operates similarly to a blockchain. It solves two growing problems in the blockchain space:

- **On-chain data** - Blockchains can be thought of as censorship resistant databases. They are great at censorship resistance, but they are really bad at being databases. On-chain data 'bloat' or 'state management' is one of the hardest scaling problems in the blockchain space. The P2WDB helps blockchains scale by providing a place to move data off-chain, but still be able to access that data on-chain.

- **Cross-chain communication** - Blockchains are like islands or silos. They are isolated from one another and can not easily communicate with one another. This leads to tribalism and a mentality of a zero-sum game. The P2WDB is a cross-chain communication medium. An event on one chain can be communicated and effect a smart contract on another chain.

![P2WDB Architecture](./dev-docs/diagrams/architecture.png)

The architecture of the database is broken up into three major sections:

- Interfaces
- P2WDB Architecture
- Backup

### Interfaces

There are three primary communication interfaces for a P2WDB:

- **REST API over HTTP** is the modern way that web 2.0 apps communicate with one another. It's fast and efficient, but it's also centralized and easy to censor. It's important to provide this interface so that the P2WDB can be accessed by web apps or phone apps.

- **JSON RPC over IPFS** is a censorship resistant replacement for the REST API. It's a little slower, but this interface can be accessed by web apps and phone apps while being able to easily tunnel through firewalls and thereby prevent attempts at censorship.

- **On-Chain Read and Write** is the most censorship resistant, but also the most expensive. Interfaces will be built for each blockchain that allows reading and writing to the database directly on-chain.

### P2WDB Architecture

Each blockchain will have its own P2WDB instance that is specific to that blockchain. The local P2WDB can be written-to by providing a proof-of-burn on that blockchain. A proof-of-burn is simply a transaction ID (TXID), where a specific quantity of a specific token (e.g. $0.01 USD in [PSF tokens](https://psfoundation.cash)) was burned in that transaction. That is the 'ticket' that lets a user write new data to the database. Anyone can read from the database for free.

The first P2WDB instance focuses on the BCH blockchain. When other blockchains are incorporated, the blockchain-specific P2WDBs will feed into a global P2WDB, which will be blockchain agnostic. This does not require any effort on the users part. Any data written to a blockchain-specific P2WDB will be automatically added to the global P2WDB. In this way, the P2WDB can function as a cross-blockchain communication medium and data provider.

### Backups

Because the P2WDB is based on [IPFS](https://ipfs.io) and [OrbitDB](https://orbitdb.org/), anyone at any time can backup the database onto [Filecoin](https://filecoin.io). 'Official' snapshots will be taken once every three months.

Smaller databases make decentralization and censorship resistance better. For this reason, future plans include the creation of a new global P2WDB every year. Previous years databases will be backed up on Filecoin, with access over IPFS. Archival access will be a secondary service.

Keeping the P2WDB small and nimble ensures it's easy to replicate by many service providers. The more service providers participating in the ecosystem, the more censorship resistant the data becomes.

## Requirements

- node **^16.15.1**
- npm **^8.11.0**
- Docker **^20.10.8**
- Docker Compose **^1.27.4**

## About This Repository

ipfs-p2wdb-service is a fork of [ipfs-service-provider](https://github.com/Permissionless-Software-Foundation/ipfs-service-provider). This project ports the pay-to-write (P2W) database (DB) specific code to the ipfs-service-provider boilerplate code. ipfs-service-provider provides both a *REST API over HTTP* interface (web2) and *JSON RPC over IPFS* interface (web3) to access the P2WDB services.

### Documentation:

- [API documentation for both interfaces can be found here.](https://p2wdb.fullstack.cash/)
- [Example code for burning tokens and writing data to the DB.](./examples)
- [Developer Documentation and Architectural Overview](./dev-docs)
- [Next Steps for this project](./dev-docs/next-steps.md)

### Operation Notes

- The PSF IPFS network operates as a private network. It does not connect or interact with the wider PSF network, relying instead on gateways to bridge the two networks, when they need to share content. This improves the performance and experience for everyone in the PSF network. To join the network, you'll need to add the [swarm.key](./swarm.key) file to the IPFS data folder.

- [Instructions on setting up IPFS private networks.](https://github.com/ipfs/go-ipfs/blob/master/docs/experimental-features.md#private-networks)
- For external installations, the swarm.key file will typically go in `~/.ipfs/swarm.key`
- For production Docker containers, the key is automatically mounted by the container.
- By default, the P2WDB accesses the BCH blockchain through https://free-bch.fullstack.cash, which is simply a running instance of [ipfs-bch-wallet-consumer](https://github.com/Permissionless-Software-Foundation/ipfs-bch-wallet-consumer). This is part of the PSF web3 infrastructure, described at [CashStack.info](https://cashstack.info). If you want to connect to a different instance, set the URL in the `CONSUMER_URL` environment variable. A list of instances is available [in this gist](https://gist.github.com/christroutner/63c5513782181f8b8ea3eb89f7cadeb6).

### Setup Development Environment

TODO: This section needs more information added to it.

There is additional developer documentation in the [dev-docs directory](./dev-docs).

## Dependencies

### Docker container

The target production deployment of this software is as a Docker container. The [docker folder](./production/docker) contains the Dockerfile and `docker-compose.yml` file to generate a new Docker image. The production target is Ubuntu Linux 20.04, running Docker and Docker Compose.

- Pull down the Docker images: `docker-compose pull`
- Start the Docker container: `docker-compose up -d`

## License

[MIT](./LICENSE.md)
