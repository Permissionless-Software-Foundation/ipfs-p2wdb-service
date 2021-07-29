#!/bin/bash
export SVC_ENV=production

# Customize these for your own system. Defaults are used.
#export ENABLE_CIRCUIT_RELAY=1
export PORT=5001 # REST API port
export IPFS_TCP_PORT=5668
export IPFS_WS_PORT=5669
export MONGO_PORT=5666

npm start
