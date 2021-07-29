#!/bin/bash

# export ORBITDB_NAME=test$RANDOM
#export ORBITDB_NAME=psf-bch-p2wdb-keyvalue-v1.0.0-0002
#export ORBITDB_NAME=/orbitdb/zdpuArknHpkUFtQrHvNaimNzVAoX4jfojz8VSjqVfH2e8ZfSM/psf-bch-p2wdb-keyvalue-v1.0.0-0002
export ORBITDB_NAME=/orbitdb/zdpuApr54GdfVBy9zbMgAc95Fzdi7eogQWSb1vEaotGDQLFte/test20854

export COORD_NAME=trout-p2wdb-dev

# Customize these for your own system. Defaults are used.
export PORT=5001 # REST API port
export IPFS_TCP_PORT=5668
export IPFS_WS_PORT=5669

node index.js
