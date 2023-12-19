#!/bin/bash

# See configuration documentation at https://p2wdb.com

# BEGIN: Optional configuration settings

# This mnemonic is used to set up persistent public key for e2ee
# Replace this with your own 12-word mnemonic.
export MNEMONIC="knock off hedgehog convince around resource level bounce merit kind menu charge"

# The human readable name this IPFS node identifies as.
export COORD_NAME=dev-p2wdb-helia

# Allow this node to function as a circuit relay. It must not be behind a firewall.
#export ENABLE_CIRCUIT_RELAY=true
# For browsers to use your circuit realy, you must set up a domain, SSL certificate,
# and you must forward that subdomain to the IPFS_WS_PORT.
#export CR_DOMAIN=subdomain.yourdomain.com

# Debug level. 0 = minimal info. 2 = max info.
export DEBUG_LEVEL=0

# Log-in information for retrieving a JWT token from FullStack.cash (if you're using it)
export FULLSTACKLOGIN=demo@demo.com
export FULLSTACKPASS=demo

# END: Optional configuration settings


# Production database connection string.
export DBURL=mongodb://172.17.0.1:5666/p2wdb-service-prod

# Configure IPFS ports
#export IPFS_TCP_PORT=5668
#export IPFS_WS_PORT=5669

# Configure REST API port
export PORT=5667

export P2W_ENV=production
export IPFS_HOST=172.17.0.1
export IPFS_API_PORT=5001
export IPFS_TCP_PORT=4001
export IPFS_WS_PORT=4003

# P2WDB specific env vars
#export ORBITDB_NAME=/orbitdb/zdpuAqNiwLiJBfbRK7uihV2hAbNSXj78ufzv5VyQb8GuvRwDh/psf-bch-p2wdb-keyvalue-v3.0.0-0001
#export ORBITDB_NAME=psf-bch-p2wdb-keyvalue-v3.0.0-0001

# Uncomment this if you are developing on a local web2 CashStack
export USE_FULLSTACKCASH=1
export APISERVER=http://172.17.0.1:3000/v5/

export ENABLE_PINNING=1

# Set the debug level for helia-coord. 0-3.
# 0 = no debug logs. 3 = maximum debug logs.
export DEBUG_LEVEL=0

npm start
