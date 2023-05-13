/*
  Mock data for the write-price-unit.js unit tests.
*/
const mockTokenData01 = {
    genesisData: {
        type: 1,
        ticker: 'P2WDB',
        name: 'P2WDB PSF Price',
        tokenId: '0ac28ff1e1fa93bf734430fd151115959307cf872c6d130b308a6d29182991d8',
        documentUri: 'ipfs://bafybeidmxb6au63p6t7wxglks3t6rxgt6t26f3gx26ezamenznkjdnwqta',
        documentHash: '6eaa12d2749cf15b00873551088975dd6748d9a6f867426db914735c58ad730a',
        decimals: 0,
        mintBatonIsActive: false,
        tokensInCirculationBN: '1',
        tokensInCirculationStr: '1',
        blockCreated: 745380,
        totalBurned: '0',
        totalMinted: '1'
    },
    immutableData: 'ipfs://bafybeidmxb6au63p6t7wxglks3t6rxgt6t26f3gx26ezamenznkjdnwqta',
    mutableData: 'ipfs://bafybeiavsmo4crwvhe6vas7e5tiecsgj7yblueqdbcoeb335js3zgi7reu'
};
const mutableData01 = {
    tokenIcon: 'https://psfoundation.cash/static/psf-logo-32a2c411985bbbf299687b06c3224384.png',
    about: 'This token is used to set the price in PSF tokens to write to P2WDB. The goal is to target $0.01 per write. This data is updated periodically to adjust to the spot price of BCH and PSF tokens.',
    p2wdbPriceHistory: [
        {
            date: '06/24/2022',
            psfPerWrite: 0.133
        },
        {
            date: '06/20/2022',
            psfPerWrite: 0.126
        }
    ]
};
const mockPriceHistory01 = [
    {
        date: '06/24/2022',
        psfPerWrite: 0.133
    },
    {
        date: '06/20/2022',
        psfPerWrite: 0.126
    }
];
const validationData01 = {
    groupId: '8e8d90ebdb1791d58eba7acd428ff3b1e21c47fb7aba2ba3b5b815aa0fe7d6d5',
    keys: [
        {
            addr: 'bitcoincash:qz4zsa22glal5c4jqm748xge657gwuw2d5t9nvg64p',
            pubKey: '021ca211a04a1d489ae77e01c28c97b02e733893890fda00a359ca8956c2e0d259',
            nft: 'e86164aaa06efac1d6453951f67beafe042f0bceb9312845a95355b1e93aa846'
        },
        {
            addr: 'bitcoincash:qpfvh07mdt7yq5czndaz5qq4g9q3m87qpspy7xaxgu',
            pubKey: '0361fd21512b9072e8f6b984d9b04c57e5779867c2ad002999372268770fcb2674',
            nft: 'da7ccbd5e24e468c9e7402489ca9148b5e76e588b73cc4aa4bbf1ca41d5808ab'
        },
        {
            addr: 'bitcoincash:qpsxtzaa7rg677akcc2znpenpsy5jr2ygywmfd45p2',
            pubKey: '03b9bdc40c478ab0536be29c368b26c48a5e8d6867fc34b77c727ab690365aae91',
            nft: '0ec318bede8c2f229db840a24cb63d662ad91e8e6c840e46e6a8ff2d173049ce'
        },
        {
            addr: 'bitcoincash:qqk3aczzggvxnfm7rwm0f9yz20yr00dmpv2f3tasdr',
            pubKey: '033c930d4cff4ba68a70f7a21443e20ad4176173380d21f8c3ce27f7ce947f3246',
            nft: '51624e772adafd7c6a9da38774e4f654282199bd5402e049ee087fc2bd900882'
        },
        {
            addr: 'bitcoincash:qpszha37cjn6n83hpxn7zz5ndaa35vygtcgslxhpuc',
            pubKey: '024be54accec310c2636140336ae548d610ba9b7ce300b3f42494b4a6f2963731f',
            nft: 'e70cc72eeb15c82e96b1f8127d3b138b2fc8ea101fe9c62302ec641c05d4b97d'
        }
    ],
    walletObj: {
        address: 'bitcoincash:pqntzt6wcp38h8ud68wjnwh437uek76lhvhlwcm4fj',
        scriptHex: 'a91426b12f4ec0627b9f8dd1dd29baf58fb99b7b5fbb87',
        publicKeys: [
            '021ca211a04a1d489ae77e01c28c97b02e733893890fda00a359ca8956c2e0d259',
            '0361fd21512b9072e8f6b984d9b04c57e5779867c2ad002999372268770fcb2674',
            '03b9bdc40c478ab0536be29c368b26c48a5e8d6867fc34b77c727ab690365aae91',
            '033c930d4cff4ba68a70f7a21443e20ad4176173380d21f8c3ce27f7ce947f3246',
            '024be54accec310c2636140336ae548d610ba9b7ce300b3f42494b4a6f2963731f'
        ],
        requiredSigners: 3
    },
    multisigAddr: 'bitcoincash:pqntzt6wcp38h8ud68wjnwh437uek76lhvhlwcm4fj',
    p2wdbWritePrice: 0.08335233
};
const approvalTx01 = {
    "txid": "a63f9fbcc901316e6e89f5a8caaad6b2ab268278b29866c6c22088bd3ab93900",
    "hash": "a63f9fbcc901316e6e89f5a8caaad6b2ab268278b29866c6c22088bd3ab93900",
    "version": 2,
    "size": 595,
    "locktime": 0,
    "vin": [
        {
            "txid": "f630f4db4b88c604e0670558782dfcfe7ad4b3d06c033dafa36f1505c3dbc58d",
            "vout": 0,
            "scriptSig": {
                "asm": "0 304402201474f95ab0e5fa3b5d6bd5f83d904c23a448f11c51a4b007b759663e76856e72022008b209df76b75e15422436f893b1b9f9f0671d65f41d0d419313f651e408c596[ALL|FORKID] 304402205ccff79c16a58da52ced457d6e898857df8fca650c7a4501406c95659c81f1e202201f79ab6615e75ae519ba8ee9d19718892dc07f3f307673149cafc5f487eb0ac0[ALL|FORKID] 3045022100dd9c0445509ada78622ae4551503c7bd84505bacfdb13994104e86e1c615a39f02205b895941fdd2a8082d27801904979992c4a6eaac3c85dd056c3c1b32865cff40[ALL|FORKID] 5321021ca211a04a1d489ae77e01c28c97b02e733893890fda00a359ca8956c2e0d25921024be54accec310c2636140336ae548d610ba9b7ce300b3f42494b4a6f2963731f21033c930d4cff4ba68a70f7a21443e20ad4176173380d21f8c3ce27f7ce947f3246210361fd21512b9072e8f6b984d9b04c57e5779867c2ad002999372268770fcb26742103b9bdc40c478ab0536be29c368b26c48a5e8d6867fc34b77c727ab690365aae9155ae",
                "hex": "0047304402201474f95ab0e5fa3b5d6bd5f83d904c23a448f11c51a4b007b759663e76856e72022008b209df76b75e15422436f893b1b9f9f0671d65f41d0d419313f651e408c5964147304402205ccff79c16a58da52ced457d6e898857df8fca650c7a4501406c95659c81f1e202201f79ab6615e75ae519ba8ee9d19718892dc07f3f307673149cafc5f487eb0ac041483045022100dd9c0445509ada78622ae4551503c7bd84505bacfdb13994104e86e1c615a39f02205b895941fdd2a8082d27801904979992c4a6eaac3c85dd056c3c1b32865cff40414cad5321021ca211a04a1d489ae77e01c28c97b02e733893890fda00a359ca8956c2e0d25921024be54accec310c2636140336ae548d610ba9b7ce300b3f42494b4a6f2963731f21033c930d4cff4ba68a70f7a21443e20ad4176173380d21f8c3ce27f7ce947f3246210361fd21512b9072e8f6b984d9b04c57e5779867c2ad002999372268770fcb26742103b9bdc40c478ab0536be29c368b26c48a5e8d6867fc34b77c727ab690365aae9155ae"
            },
            "sequence": 4294967295,
            "address": "bitcoincash:pqntzt6wcp38h8ud68wjnwh437uek76lhvhlwcm4fj",
            "value": 0.000756
        }
    ],
    "vout": [
        {
            "value": 0,
            "n": 0,
            "scriptPubKey": {
                "asm": "OP_RETURN 415050524f5645 66386561316663643434383161646664363263363235316336613466363366336435616333643566646363333862333530643332316439333235346466363566",
                "hex": "6a07415050524f56454066386561316663643434383161646664363263363235316336613466363366336435616333643566646363333862333530643332316439333235346466363566",
                "type": "nulldata"
            }
        },
        {
            "value": 0.00001,
            "n": 1,
            "scriptPubKey": {
                "asm": "OP_DUP OP_HASH160 dd9d58d7672be6675262069534b173c113f59e85 OP_EQUALVERIFY OP_CHECKSIG",
                "hex": "76a914dd9d58d7672be6675262069534b173c113f59e8588ac",
                "reqSigs": 1,
                "type": "pubkeyhash",
                "addresses": [
                    "bitcoincash:qrwe6kxhvu47ve6jvgrf2d93w0q38av7s5xm9xfehr"
                ]
            }
        },
        {
            "value": 0.00072671,
            "n": 2,
            "scriptPubKey": {
                "asm": "OP_HASH160 26b12f4ec0627b9f8dd1dd29baf58fb99b7b5fbb OP_EQUAL",
                "hex": "a91426b12f4ec0627b9f8dd1dd29baf58fb99b7b5fbb87",
                "reqSigs": 1,
                "type": "scripthash",
                "addresses": [
                    "bitcoincash:pqntzt6wcp38h8ud68wjnwh437uek76lhvhlwcm4fj"
                ]
            }
        }
    ],
    "hex": "02000000018dc5dbc305156fa3af3d036cd0b3d47afefc2d78580567e004c6884bdbf430f600000000fd89010047304402201474f95ab0e5fa3b5d6bd5f83d904c23a448f11c51a4b007b759663e76856e72022008b209df76b75e15422436f893b1b9f9f0671d65f41d0d419313f651e408c5964147304402205ccff79c16a58da52ced457d6e898857df8fca650c7a4501406c95659c81f1e202201f79ab6615e75ae519ba8ee9d19718892dc07f3f307673149cafc5f487eb0ac041483045022100dd9c0445509ada78622ae4551503c7bd84505bacfdb13994104e86e1c615a39f02205b895941fdd2a8082d27801904979992c4a6eaac3c85dd056c3c1b32865cff40414cad5321021ca211a04a1d489ae77e01c28c97b02e733893890fda00a359ca8956c2e0d25921024be54accec310c2636140336ae548d610ba9b7ce300b3f42494b4a6f2963731f21033c930d4cff4ba68a70f7a21443e20ad4176173380d21f8c3ce27f7ce947f3246210361fd21512b9072e8f6b984d9b04c57e5779867c2ad002999372268770fcb26742103b9bdc40c478ab0536be29c368b26c48a5e8d6867fc34b77c727ab690365aae9155aeffffffff0300000000000000004a6a07415050524f56454066386561316663643434383161646664363263363235316336613466363366336435616333643566646363333862333530643332316439333235346466363566e8030000000000001976a914dd9d58d7672be6675262069534b173c113f59e8588acdf1b01000000000017a91426b12f4ec0627b9f8dd1dd29baf58fb99b7b5fbb8700000000",
    "blockhash": "000000000000000003e90bff17eeb147b0fb532abeddd5ba5a7ec23347e300ee",
    "confirmations": 6004,
    "time": 1677006961,
    "blocktime": 1677006961,
    "isValidSlp": false
};
const validationTx01 = {
    "txid": "f8ea1fcd4481adfd62c6251c6a4f63f3d5ac3d5fdcc38b350d321d93254df65f",
    "hash": "f8ea1fcd4481adfd62c6251c6a4f63f3d5ac3d5fdcc38b350d321d93254df65f",
    "version": 2,
    "size": 361,
    "locktime": 0,
    "vin": [
        {
            "txid": "2879a62158f0c3953750688e439d87737face939b5493b213f2e7d3bf505ddc4",
            "vout": 2,
            "scriptSig": {
                "asm": "3045022100919192436273a7b53994e151d6e2359934fcdb17f60f37954fab06f5012fccea02207c329deb48b0eaff25651360ac71d159b8b0bb49072aea3a6d4b657e61f24c30[ALL|FORKID] 02239ca86fcc2910aefb3bd06419c15bd542a7ce4e1c34c48ca9d398640cf94a3e",
                "hex": "483045022100919192436273a7b53994e151d6e2359934fcdb17f60f37954fab06f5012fccea02207c329deb48b0eaff25651360ac71d159b8b0bb49072aea3a6d4b657e61f24c30412102239ca86fcc2910aefb3bd06419c15bd542a7ce4e1c34c48ca9d398640cf94a3e"
            },
            "sequence": 4294967295,
            "address": "bitcoincash:qz4mn3ayguhyylz50zsg953yzs8ay3akrg3wle6qj6",
            "value": 0.00710985
        }
    ],
    "vout": [
        {
            "value": 0,
            "n": 0,
            "scriptPubKey": {
                "asm": "OP_RETURN 0 7b22636964223a226261667962656962356436733674337471346c687770326f63767a377932777334637a676b726d686c687635793561657968366271726d73787869222c227473223a313637363536303234373136387d",
                "hex": "6a004c587b22636964223a226261667962656962356436733674337471346c687770326f63767a377932777334637a676b726d686c687635793561657968366271726d73787869222c227473223a313637363536303234373136387d",
                "type": "nulldata"
            }
        },
        {
            "value": 0.00002,
            "n": 1,
            "scriptPubKey": {
                "asm": "OP_DUP OP_HASH160 203b64bfbaa9e58333295b621159ddebc591ecb1 OP_EQUALVERIFY OP_CHECKSIG",
                "hex": "76a914203b64bfbaa9e58333295b621159ddebc591ecb188ac",
                "reqSigs": 1,
                "type": "pubkeyhash",
                "addresses": [
                    "bitcoincash:qqsrke9lh257tqen99dkyy2emh4uty0vky9y0z0lsr"
                ]
            }
        },
        {
            "value": 0.00708077,
            "n": 2,
            "scriptPubKey": {
                "asm": "OP_DUP OP_HASH160 abb9c7a4472e427c5478a082d224140fd247b61a OP_EQUALVERIFY OP_CHECKSIG",
                "hex": "76a914abb9c7a4472e427c5478a082d224140fd247b61a88ac",
                "reqSigs": 1,
                "type": "pubkeyhash",
                "addresses": [
                    "bitcoincash:qz4mn3ayguhyylz50zsg953yzs8ay3akrg3wle6qj6"
                ]
            }
        },
        {
            "value": 0.00000546,
            "n": 3,
            "scriptPubKey": {
                "asm": "OP_DUP OP_HASH160 dd9d58d7672be6675262069534b173c113f59e85 OP_EQUALVERIFY OP_CHECKSIG",
                "hex": "76a914dd9d58d7672be6675262069534b173c113f59e8588ac",
                "reqSigs": 1,
                "type": "pubkeyhash",
                "addresses": [
                    "bitcoincash:qrwe6kxhvu47ve6jvgrf2d93w0q38av7s5xm9xfehr"
                ]
            }
        }
    ],
    "hex": "0200000001c4dd05f53b7d2e3f213b49b539e9ac7f73879d438e68503795c3f05821a67928020000006b483045022100919192436273a7b53994e151d6e2359934fcdb17f60f37954fab06f5012fccea02207c329deb48b0eaff25651360ac71d159b8b0bb49072aea3a6d4b657e61f24c30412102239ca86fcc2910aefb3bd06419c15bd542a7ce4e1c34c48ca9d398640cf94a3effffffff0400000000000000005c6a004c587b22636964223a226261667962656962356436733674337471346c687770326f63767a377932777334637a676b726d686c687635793561657968366271726d73787869222c227473223a313637363536303234373136387dd0070000000000001976a914203b64bfbaa9e58333295b621159ddebc591ecb188acedcd0a00000000001976a914abb9c7a4472e427c5478a082d224140fd247b61a88ac22020000000000001976a914dd9d58d7672be6675262069534b173c113f59e8588ac00000000",
    "blockhash": "000000000000000001a1b31a8ec4a683a13fbe287209949e4dd54045860f776e",
    "confirmations": 6784,
    "time": 1676561115,
    "blocktime": 1676561115,
    "isValidSlp": false
};
const normalTx01 = {
    "txid": "6e9f2f01557ac3179de3c5857667333ed955292f2c15764c5a267fd46ce96a1c",
    "hash": "6e9f2f01557ac3179de3c5857667333ed955292f2c15764c5a267fd46ce96a1c",
    "version": 2,
    "size": 306,
    "locktime": 0,
    "vin": [
        {
            "txid": "4d6d74764d3e276a238acc3f9dafaeebab934035fcf86bf2f534aa6f5177ed49",
            "vout": 0,
            "scriptSig": {
                "asm": "d185f834537d7ef457782c34bd7cb35a8e98f1160248781b6609c8ac07636dd0e7f82443ba0af02fec31987c2d77b41a50c9deed487dc73fd6894f69b0ae53bb[ALL|FORKID] 03db0327a688c138b21680133b345f20a90434cef6f9a54636c15df5c3a64420d6 7452876376a914dd9d58d7672be6675262069534b173c113f59e8588ac6776538763145c0d425b16c275b6f0b28f04e8227d91e60eb9fe6776548814dd9d58d7672be6675262069534b173c113f59e8568141cc9ce4cd0c513ab118063e0127fc0c7ed0857706b6b01517e7c76a96c88bb76a96c88ac68",
                "hex": "41d185f834537d7ef457782c34bd7cb35a8e98f1160248781b6609c8ac07636dd0e7f82443ba0af02fec31987c2d77b41a50c9deed487dc73fd6894f69b0ae53bb412103db0327a688c138b21680133b345f20a90434cef6f9a54636c15df5c3a64420d64c777452876376a914dd9d58d7672be6675262069534b173c113f59e8588ac6776538763145c0d425b16c275b6f0b28f04e8227d91e60eb9fe6776548814dd9d58d7672be6675262069534b173c113f59e8568141cc9ce4cd0c513ab118063e0127fc0c7ed0857706b6b01517e7c76a96c88bb76a96c88ac68"
            },
            "sequence": 0,
            "address": "bitcoincash:prxjycr9jegpmmcpfjandsres2j7h56ch5ztlctze6",
            "value": 0.0001
        }
    ],
    "vout": [
        {
            "value": 0.000094,
            "n": 0,
            "scriptPubKey": {
                "asm": "OP_DUP OP_HASH160 dd9d58d7672be6675262069534b173c113f59e85 OP_EQUALVERIFY OP_CHECKSIG",
                "hex": "76a914dd9d58d7672be6675262069534b173c113f59e8588ac",
                "reqSigs": 1,
                "type": "pubkeyhash",
                "addresses": [
                    "bitcoincash:qrwe6kxhvu47ve6jvgrf2d93w0q38av7s5xm9xfehr"
                ]
            }
        }
    ],
    "hex": "020000000149ed77516faa34f5f26bf8fc354093abebaeaf9d3fcc8a236a273e4d76746d4d00000000dd41d185f834537d7ef457782c34bd7cb35a8e98f1160248781b6609c8ac07636dd0e7f82443ba0af02fec31987c2d77b41a50c9deed487dc73fd6894f69b0ae53bb412103db0327a688c138b21680133b345f20a90434cef6f9a54636c15df5c3a64420d64c777452876376a914dd9d58d7672be6675262069534b173c113f59e8588ac6776538763145c0d425b16c275b6f0b28f04e8227d91e60eb9fe6776548814dd9d58d7672be6675262069534b173c113f59e8568141cc9ce4cd0c513ab118063e0127fc0c7ed0857706b6b01517e7c76a96c88bb76a96c88ac680000000001b8240000000000001976a914dd9d58d7672be6675262069534b173c113f59e8588ac00000000",
    "blockhash": "0000000000000000027cf0090aeeff8360d17c7379d383634173cad8a0b074b4",
    "confirmations": 8356,
    "time": 1675604093,
    "blocktime": 1675604093,
    "isValidSlp": false
};
const approvalObj01 = {
    "approvalTxid": "a63f9fbcc901316e6e89f5a8caaad6b2ab268278b29866c6c22088bd3ab93900",
    "updateTxid": "f8ea1fcd4481adfd62c6251c6a4f63f3d5ac3d5fdcc38b350d321d93254df65f",
    "approvalTxDetails": approvalTx01,
    "opReturn": "j\u0007APPROVE@f8ea1fcd4481adfd62c6251c6a4f63f3d5ac3d5fdcc38b350d321d93254df65f"
};
const updateObj01 = {
    "cid": "bafybeib5d6s6t3tq4lhwp2ocvz7y2ws4czgkrmhlhv5y5aeyh6bqrmsxxi",
    "ts": 1676560247168,
    "txid": "f8ea1fcd4481adfd62c6251c6a4f63f3d5ac3d5fdcc38b350d321d93254df65f",
    "txDetails": validationTx01
};
export { mockTokenData01 };
export { mutableData01 };
export { mockPriceHistory01 };
export { validationData01 };
export { approvalTx01 };
export { validationTx01 };
export { normalTx01 };
export { approvalObj01 };
export { updateObj01 };
export default {
    mockTokenData01,
    mutableData01,
    mockPriceHistory01,
    validationData01,
    approvalTx01,
    validationTx01,
    normalTx01,
    approvalObj01,
    updateObj01
};
