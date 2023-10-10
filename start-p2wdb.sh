#!/bin/bash

# See configuration documentation at https://p2wdb.com

# The P2WDB this app should mirror.
#export ORBITDB_NAME=/orbitdb/zdpuAwAxsMjxUTP58Tbd4vps2bTJNBoKkjs72SDLxuWjVy1Bx/psf-bch-p2wdb-keyvalue-v1.0.0-0003
#export ORBITDB_NAME=test0423

# The name this app uses when connecting to ipfs-coord subnet.
export COORD_NAME=ipfs-p2wdb-dev

# Customize these for your own system. Defaults are used.
export PORT=5002 # REST API port
export IPFS_API_PORT=5001
export IPFS_TCP_PORT=5668
export IPFS_WS_PORT=5669

# (optional) Log-in information for retrieving a JWT token from FullStack.cash.
#export GET_JWT_AT_STARTUP=0
#export FULLSTACKLOGIN=demo@demo.com
#export FULLSTACKPASS=demo

# Run with a local instance of Cash Stack (dev environment)
export USE_FULLSTACKCASH=1
export APISERVER=http://localhost:3000/v5/

# Set the debug verbosity level
export DEBUG_LEVEL=0

node index.js
