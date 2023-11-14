# Replication E2E Test

The files in this folder set up an end-to-end test to see how well data replicates between OrbitDB nodes. This test sets up a network of three nodes:
- host - is an OrbitDB instance on an Ubuntu host.
- VPS - is an OrbitDB instance on an Ubuntu cloud computer with IP4 address.
- VM - is an OrbitDB instance on an Ubuntu VM running on the host.

A DB is created with the host and replicatd by the VPS. The VM then connects to the VPS and the database should be replicated on the VM.
