/*
  Mocking data for the can-append-validator.unit.js unit test library.
*/

// A valid transaction object burning PSF tokens to add data to the database.
// hash: zdpuAxi6UyHxg55bMrdySsmfKrgSwmQcB5Xq2asadeFBfNsyu
// address: bitcoincash:qq2jts90ntntwnyr3hps5jlxzy3k4jdraqx5ce0g9g
// signature: IDI1M9rGrj0az6k1d29nuPmfKw2+M85ONMBvw/3qtP4pOt/HcN8Kyrzthzufp9Fimah236GISkuFLzA19A4AIOk=
// message: 2023-11-22T03:39:16.238Z
const validTx01 = {
  "txid": "6a08f73da620a8395437063b1dd47b7165c40e89e152d139a121f4b50a1aef4d",
  "hash": "6a08f73da620a8395437063b1dd47b7165c40e89e152d139a121f4b50a1aef4d",
  "version": 2,
  "size": 471,
  "locktime": 0,
  "vin": [
    {
      "txid": "b840cd678cc964639512472cdfd4efb13a03eef02636462ad7c6ba29442ce9ff",
      "vout": 1,
      "scriptSig": {
        "asm": "3045022100ccea27f97859c68b85b36b9367018e231ccc09a4ccec572c4f0c6c30c5db1c3e022044b3f3eede439048aafc5a694005cd6c294b20258c33006db6441b864368768c[ALL|FORKID] 02c46c71f71d35b019d6371c2ba08caedcaddd44034ba0546501c9b0d998dda8a2",
        "hex": "483045022100ccea27f97859c68b85b36b9367018e231ccc09a4ccec572c4f0c6c30c5db1c3e022044b3f3eede439048aafc5a694005cd6c294b20258c33006db6441b864368768c412102c46c71f71d35b019d6371c2ba08caedcaddd44034ba0546501c9b0d998dda8a2"
      },
      "sequence": 4294967295,
      "address": "bitcoincash:qq2jts90ntntwnyr3hps5jlxzy3k4jdraqx5ce0g9g",
      "value": 0.00000546,
      "tokenQtyStr": "4.07105866",
      "tokenQty": 4.07105866,
      "tokenId": "38e97c5d7d3585a2cbf3f9580c82ca33985f9cb0845d4dcce220cb709f9538b0"
    },
    {
      "txid": "b840cd678cc964639512472cdfd4efb13a03eef02636462ad7c6ba29442ce9ff",
      "vout": 3,
      "scriptSig": {
        "asm": "3044022058c390a2f758ad42f17518c96c68d1fa84228eb5ab609f7a74dae92d4607b69b02204103e64d8e140b195ef8f721dce6233e7887804ffb24dac4dc4d9da3519b1919[ALL|FORKID] 02c46c71f71d35b019d6371c2ba08caedcaddd44034ba0546501c9b0d998dda8a2",
        "hex": "473044022058c390a2f758ad42f17518c96c68d1fa84228eb5ab609f7a74dae92d4607b69b02204103e64d8e140b195ef8f721dce6233e7887804ffb24dac4dc4d9da3519b1919412102c46c71f71d35b019d6371c2ba08caedcaddd44034ba0546501c9b0d998dda8a2"
      },
      "sequence": 4294967295,
      "address": "bitcoincash:qq2jts90ntntwnyr3hps5jlxzy3k4jdraqx5ce0g9g",
      "value": 0.00491064,
      "tokenQtyStr": "NaN",
      "tokenQty": null,
      "tokenId": "38e97c5d7d3585a2cbf3f9580c82ca33985f9cb0845d4dcce220cb709f9538b0"
    }
  ],
  "vout": [
    {
      "value": 0,
      "n": 0,
      "scriptPubKey": {
        "asm": "OP_RETURN 5262419 1 1145980243 38e97c5d7d3585a2cbf3f9580c82ca33985f9cb0845d4dcce220cb709f9538b0 -5314744638337187840",
        "hex": "6a04534c500001010453454e442038e97c5d7d3585a2cbf3f9580c82ca33985f9cb0845d4dcce220cb709f9538b0080000000017c4c1c9",
        "type": "nulldata"
      },
      "tokenQty": null,
      "tokenQtyStr": null
    },
    {
      "value": 0.00000546,
      "n": 1,
      "scriptPubKey": {
        "asm": "OP_DUP OP_HASH160 1525c0af9ae6b74c838dc30a4be611236ac9a3e8 OP_EQUALVERIFY OP_CHECKSIG",
        "hex": "76a9141525c0af9ae6b74c838dc30a4be611236ac9a3e888ac",
        "reqSigs": 1,
        "type": "pubkeyhash",
        "addresses": [
          "bitcoincash:qq2jts90ntntwnyr3hps5jlxzy3k4jdraqx5ce0g9g"
        ]
      },
      "tokenQtyStr": "3.98770633",
      "tokenQty": 3.98770633
    },
    {
      "value": 0.00002,
      "n": 2,
      "scriptPubKey": {
        "asm": "OP_DUP OP_HASH160 203b64bfbaa9e58333295b621159ddebc591ecb1 OP_EQUALVERIFY OP_CHECKSIG",
        "hex": "76a914203b64bfbaa9e58333295b621159ddebc591ecb188ac",
        "reqSigs": 1,
        "type": "pubkeyhash",
        "addresses": [
          "bitcoincash:qqsrke9lh257tqen99dkyy2emh4uty0vky9y0z0lsr"
        ]
      },
      "tokenQty": null,
      "tokenQtyStr": null
    },
    {
      "value": 0.00488221,
      "n": 3,
      "scriptPubKey": {
        "asm": "OP_DUP OP_HASH160 1525c0af9ae6b74c838dc30a4be611236ac9a3e8 OP_EQUALVERIFY OP_CHECKSIG",
        "hex": "76a9141525c0af9ae6b74c838dc30a4be611236ac9a3e888ac",
        "reqSigs": 1,
        "type": "pubkeyhash",
        "addresses": [
          "bitcoincash:qq2jts90ntntwnyr3hps5jlxzy3k4jdraqx5ce0g9g"
        ]
      },
      "tokenQty": null,
      "tokenQtyStr": null
    }
  ],
  "hex": "0200000002ffe92c4429bac6d72a463626f0ee033ab1efd4df2c4712956364c98c67cd40b8010000006b483045022100ccea27f97859c68b85b36b9367018e231ccc09a4ccec572c4f0c6c30c5db1c3e022044b3f3eede439048aafc5a694005cd6c294b20258c33006db6441b864368768c412102c46c71f71d35b019d6371c2ba08caedcaddd44034ba0546501c9b0d998dda8a2ffffffffffe92c4429bac6d72a463626f0ee033ab1efd4df2c4712956364c98c67cd40b8030000006a473044022058c390a2f758ad42f17518c96c68d1fa84228eb5ab609f7a74dae92d4607b69b02204103e64d8e140b195ef8f721dce6233e7887804ffb24dac4dc4d9da3519b1919412102c46c71f71d35b019d6371c2ba08caedcaddd44034ba0546501c9b0d998dda8a2ffffffff040000000000000000376a04534c500001010453454e442038e97c5d7d3585a2cbf3f9580c82ca33985f9cb0845d4dcce220cb709f9538b0080000000017c4c1c922020000000000001976a9141525c0af9ae6b74c838dc30a4be611236ac9a3e888acd0070000000000001976a914203b64bfbaa9e58333295b621159ddebc591ecb188ac1d730700000000001976a9141525c0af9ae6b74c838dc30a4be611236ac9a3e888ac00000000",
  "blockhash": "0000000000000000001ff4e2dbf71e4f67bb93a415910e4782c23df76ff77115",
  "confirmations": 541,
  "time": 1700624402,
  "blocktime": 1700624402,
  "blockheight": 820463,
  "isSlpTx": true,
  "tokenTxType": "SEND",
  "tokenId": "38e97c5d7d3585a2cbf3f9580c82ca33985f9cb0845d4dcce220cb709f9538b0",
  "tokenType": 1,
  "tokenTicker": "PSF",
  "tokenName": "Permissionless Software Foundation",
  "tokenDecimals": 8,
  "tokenUri": "psfoundation.cash",
  "tokenDocHash": "",
  "isValidSlp": true
}

const validEntry01 = {
    v: 2,
    id: '/orbitdb/zdpuAxsSm9BNCBchqXXLLqtwkmCcGepzJ96q4AMH8KSdjomtS',
    key: '026d3ddb5bc392e99e2d5673d406dd03a9da17ad1abcbfaf2d3c86495d71e922f6',
    sig: '304402202aa4e90151b472b3880c0460290ed32ee46345bd243655f032aea17d56c0e3410220772806b9e9d9d600f53f7070c68a85171d3077b9a269761f2eb7f415db08c528',
    next: [ 'zdpuAyBgZnsuL9b2NcfzLcgynJ1rqFr91Q7hJ3iCFCeNVKnrV' ],
    refs: [
      'zdpuArwm9DtzFZ6JoHvEV2gPuboKr3M9TENE2NTCQ3bR8mZ5B',
      'zdpuB1dMpw4bknMPE3627hXoaNMv9ge1ifkKapBx8ZmZTfgSt',
      'zdpuAwzmgwEMa5Mu2pXXFN7sGiizK2w8SMFms7EYRoy6YBbpE',
      'zdpuB13nQsfGHjcrHZEWCqcacssRfhky7rFtNCvryQRHRgBzn',
      'zdpuAmcNrSyQqddBLEjV9BzTXbJsm6hMbkUkCpMDiiZE4tAkC',
      'zdpuApNx3mmTzpSLbH3dENMWowZqmXGGvW4cMMNrxj7d1F3b2',
      'zdpuAkShaL4YpDyHqvcaQ8bio1XZvr7CCwQKQXE8EaN8mJ9oz',
      'zdpuAui3bRd7QSULa8GrjscxZFA59B7F3byWHtJAsmtchrx2s',
      'zdpuAoTbLcf9QEdk5GWEinvYMZveRYzuJsZpXov2F1BG56yxG',
      'zdpuAkmDNViKD2u2Aob7UvnSXhAEmymBh1oM6SjWR2a3ujww7',
      'zdpuAqx2oye3LDKEMnGt5mLRYHwu7AN8fLeZdKPciyw2utYgN',
      'zdpuB2UXnKCs2geX65fgKouyu5PQcnnfLXKVqzQ3g5jVbJBB4',
      'zdpuB25mvBgZmFUjJ9w7JMvCns7fmM2tK3qrz4hnsjMMCNG2c',
      'zdpuB2mhnWq8rzz3DN2zUid9cgvRa2CbEqtLif1tXqesfV1tT',
      'zdpuAzHkMVN66AFmyuXYMop7ECaKWAHv7BdNindoMzdToB5D8',
      'zdpuAmAZ3a29sJEEdRmV5cgoa89AFdbxa3M4dqiRAdrVs3wBx'
    ],
    clock: {
      id: '026d3ddb5bc392e99e2d5673d406dd03a9da17ad1abcbfaf2d3c86495d71e922f6',
      time: 3069
    },
    payload: {
      op: 'PUT',
      key: '6a08f73da620a8395437063b1dd47b7165c40e89e152d139a121f4b50a1aef4d',
      value: {
        "appId":"p2wdb-pin-001",
        "data": {
          "cid":"bafybeibyai4cehyjotlkaewnu3uzyjcaz26my4hba5irjvxpq5ggkndqsy"
        },
        "timestamp":"2023-11-23T00:04:23.732Z",
        "localTimeStamp":"11/23/2023, 12:04:23 AM"
      }
    },
    identity: 'zdpuAt5dSFVbNzxVi24txwEkpRHPLNsdM8ry3LY3aQNTaeyRP',
    hash: 'zdpuAxi6UyHxg55bMrdySsmfKrgSwmQcB5Xq2asadeFBfNsyu',
    bytes: []
  }

export default {
  validTx01,
  validEntry01
}
