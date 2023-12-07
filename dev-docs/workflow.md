# Workflow

This document gives a high-level description of how new entries are added to the database.

There are two separate code paths for adding new entries to the database:
- *New entries* added to the database by a peer are syndicated and each new entry goes through a `canAppend()` function to validate the proof-of-burn.
- OrbitDB assumes that *old entries* are valid, but P2WDB forces these entries to route through the `canAppend()` validation function before adding them to the OrbitDB index.

In the case of a new peer syncing a new database, both code paths are executed. The tip of the database is treated as a new entry and handled by the first code path, but all older entries are handled by the second code path.

## New Entry Code Path
In order for a peer to receive new entries, it must be connected to other IPFS peers and they must establish a pubsub channel. The primary form of communication is over WebRTC. Peers establish their WebRTC connections via V2 Circuit Relays. OrbitDB automatically takes care of the pubsub channel and syncing.

The `canAppend()` function is declared in the [can-append-validator.js library](../src/adapters/orbit/can-append-validator.js). This function returns `true` or `false`, based on the validity of the proof-of-burn. If it returns false, the entry will not be added to the database.

Validating proof-of-burn against the blockchain is expensive in terms of time and compute. A local Mongo database is used to cache the validation results for each entry. If the entry is reconsidered at startup or from being passed by another peer, the validation result is retrieved from the Mongo database.

## Old Entry Code Path
The current version of OrbitDB (v1.0.1) assumes that older entries in the database are valid. When a new node is syncing, it will only treat the latest database entry as new, and then assume all older, chained database entries are valid.

P2WDB hooks into the OrbitDB code and forces each entry to go through the `canAppend()` function before the entry is added to the OrbitDB index and written to disk. This code is defined in the `get()` funciton of [op-log log.js file](../src/adapters/orbit/log.js).
