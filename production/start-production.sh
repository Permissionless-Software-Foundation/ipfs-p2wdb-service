#!/bin/bash
export SVC_ENV=production
export ORBITDB_NAME=/orbitdb/zdpuAwAxsMjxUTP58Tbd4vps2bTJNBoKkjs72SDLxuWjVy1Bx/psf-bch-p2wdb-keyvalue-v1.0.0-0003

export COORD_NAME=generic-p2wdb-production

# Customize these for your own system. Defaults are used.
#export ENABLE_CIRCUIT_RELAY=1
export PORT=5001 # REST API port
export IPFS_TCP_PORT=5668
export IPFS_WS_PORT=5669
export MONGO_PORT=5666

# (optional) Log-in information for retrieving a JWT token from FullStack.cash.
export FULLSTACKLOGIN=demo@demo.com
export FULLSTACKPASS=demo

npm start
