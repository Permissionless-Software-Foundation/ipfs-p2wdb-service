# ipfs-p2wdb-service Specification

This document contains a high-level, human-readable specification for the four major architectural areas of the ipfs-p2wdb-service:

- Entities
- Use Cases
- Controllers (inputs)
- Adapters (outputs)

This reflects the [Clean Architecture](./specification.md) design pattern.

## Entities

Entities make up the core business concepts. If these entities change, they fundamentally change the entire app.

### Entry

The Entry Entity is the core concept in the P2WDB. An entry exists both in the p2p Orbit database and in the local Mongo database. Entries in the local Mongo database have been verified by the local installation, which is allowed to have discrepancies with the p2p Orbit database. Ultimately the p2p database is how other peers coordinate data, but each individual peer independently validates their Entries.

The Entry Entity has the following properties:

- **hash** - is an IPFS [CID](https://docs.ipfs.io/concepts/content-addressing/) assigned to the Entry by OrbitDB. It starts with the letter `z`.
- **key** - Entries are stored as key-value pairs. The key is the transaction ID (TXID) of the transaction burning PSF tokens and providing the proof-of-burn. This TXID provides a universally unique key for the key-value pair.
- **isValid** - A judgment by the local node on the validity of the proof-of-burn.
- **value** - The value part of the key-value pair. This value is an object that contains the following properties:
  - **message** - a clear-text message used to generate a cryptographic signature.
  - **signature** - a eliptic curve signature to prove the DB entry comes from the same address that provided the proof-of-burn.
  - **appId** - A short string containing an identifier for a specific application. This allows the database to trigger a webhook.
  - **data** - A string of text containing up to 10KB of data. Usually a stringified JSON object.

### Webhook

The Webhook Entity is used to trigger a POST REST API call to another computer when a new piece of data is added to the P2WDB with an `appId` that matches the one defined in the webhook. This provides a convenient way for any application to leverage a global censorship-resistant database while ignoring data that does not apply to it. This Entity has the following properties:

- **appId** - The application identifier to match in order to trigger the webhook. When a new entry is added to the P2WDB with an `appId` property that matches, the webhook will be triggered.
- **url** - The URL to call with the webhook. When triggered, the webhook will make a POST call to this URL. In the `body` of the call, it will pass the TXID (`key`) and CID (`hash`) of the new entry.

## Use Cases

Use cases are verbs or actions that is done _to_ an Entity or _between_ Entities.

### Entry

Below are use-cases for the Entry Entity:

- **Add Entry** - A new entry to the P2WDB. This explicitly adds the entry to the OrbitDB. Entry into the local MongoDB is automatically triggered through a replication event.
- **Read Entry** - Read a specific entry in the local (MongoDB) database, given its `key` (TXID) or `hash` (CID) value.
- **Revalidate** - Attempt to validate an entry that has been marked invalid.
- **Read Invalid** - Returns a paginated list of entries that have been marked invalid.

### Webhook

Below are use-cases for the Webhook Entity:

- **Add Webhook** - Create a new webhook that will trigger when new data matches the `appId`.
- **Remove Webhook** - Remove a webhook and prevent it from triggering.

## Controllers

Controllers are inputs to the system. When a controller is activated, it causes the system to react in some way.

### REST API & JSON RPC

The REST API and JSON RPC have matching endpoints. They use the same REST verbs and call the same use-cases functions. They have the following endpoints:

- Entry

  - **POST Entry** - Add a new entry to the P2WDB.
  - **GET All** - Get all validated entries in the MongoDB database. This endpoint is primarily used for debugging, and may be deprecated in the future. Once the database gets to a large size, this call will be prohibitively expensive and will either need to be deprecated or paginated.
  - **GET by Hash** - Get a single entry from the MongoDB using the `hash` or CID value of the entry.
  - **GET by TXID** - Get a single entry from the MongoDB using the `key` or TXID representing the proof-of-burn.

- Webhook
  - **POST Webhook** - Add a new webhook to the system.
  - **DELETE webhook** - Remove a webhook from the system. Returns true on a success, false if the entry is not found.

## Adapters

Adapters are output libraries so that the business logic doesn't need to know any specific information about the I/O. They are essentially the output of the application. This application contains the following adapters:

- **entry** - An adapter for the Mongoose models and interaction with local MongoDB, used by the Entry Use Cases.
- **webhook** - An adapter for the Mongoose models and interaction with local MongoDB, used by the Webhook Use Cases.
- **p2wdb** - A top-level adapter for the IPFS components of the P2WDB. It wraps these lower-level adapter libraries:
  - **ipfs** - An adapter for starting an IPFS node and connecting to the network.
  - **ipfs-coord** - An adapter library that wraps the ipfs-coord library. ipfs-coord is used to find other peers, establish pub-sub channels, and set up e2e encrypted communication and payment between peers.
  - **orbit** - An adapter for OrbitDB KeyValue store, and events around OrbitDB functionality.

## Dependency Diagrams

The specifications above form a dependency tree of libraries. Visually, the dependency tree looks like this:

![Dependency Graph](./diagrams/p2wdb-clean-architecture.png)
