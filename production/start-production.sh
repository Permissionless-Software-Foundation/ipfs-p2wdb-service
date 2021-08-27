#!/bin/bash

# Become root.
echo 'abcd8765' | sudo -S pwd
sudo chown -R safeuser .ipfsdata

export P2W_ENV=production
echo "Env: $P2W_ENV"
export ORBITDB_NAME=/orbitdb/zdpuAwAxsMjxUTP58Tbd4vps2bTJNBoKkjs72SDLxuWjVy1Bx/psf-bch-p2wdb-keyvalue-v1.0.0-0003

export COORD_NAME=generic-p2wdb-production

# Debug level. 0 = minimal info. 2 = max info.
export DEBUG_LEVEL=2

# This mnemonic is used to set up persistent public key for e2ee
# Replace this with your own 12-word mnemonic.
export MNEMONIC="olive two muscle bottom coral ancient wait legend bronze useful process session"

# Production database connection string.
#export DBURL=mongodb://172.17.0.1:5555/ipfs-service-prod

# Customize these for your own system. Defaults are used.
#export ENABLE_CIRCUIT_RELAY=1
export PORT=5001 # REST API port
export IPFS_TCP_PORT=5668
export IPFS_WS_PORT=5669
export MONGO_PORT=5666
echo "Mongo port: $MONGO_PORT"

# (optional) Log-in information for retrieving a JWT token from FullStack.cash.
export FULLSTACKLOGIN=demo@demo.com
export FULLSTACKPASS=demo

node index.js
