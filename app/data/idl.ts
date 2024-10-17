/**
 * Program IDL in camelCase format in order to be used in JS/TS.
 *
 * Note that this is only a type helper and is not the actual IDL. The original
 * IDL can be found at `target/idl/paystream_mvp.json`.
 */
export type PaystreamMvp = {
    "address": "GHsd2cgzpaoyFQ9hoQkhcXmAegbLaVh2zLFCjBFdotNn",
    "metadata": {
      "name": "paystreamMvp",
      "version": "0.1.0",
      "spec": "0.1.0",
      "description": "Created with Anchor"
    },
    "instructions": [
      {
        "name": "cancelStream",
        "discriminator": [
          218,
          221,
          38,
          25,
          177,
          207,
          188,
          91
        ],
        "accounts": [
          {
            "name": "streamAccount",
            "writable": true,
            "pda": {
              "seeds": [
                {
                  "kind": "const",
                  "value": [
                    115,
                    116,
                    114,
                    101,
                    97,
                    109
                  ]
                },
                {
                  "kind": "account",
                  "path": "authority"
                }
              ]
            }
          },
          {
            "name": "authority",
            "writable": true,
            "signer": true
          },
          {
            "name": "receiver",
            "writable": true
          },
          {
            "name": "systemProgram",
            "address": "11111111111111111111111111111111"
          }
        ],
        "args": [
          {
            "name": "streamIndex",
            "type": "u64"
          }
        ]
      },
      {
        "name": "createStream",
        "discriminator": [
          71,
          188,
          111,
          127,
          108,
          40,
          229,
          158
        ],
        "accounts": [
          {
            "name": "streamAccount",
            "writable": true,
            "pda": {
              "seeds": [
                {
                  "kind": "const",
                  "value": [
                    115,
                    116,
                    114,
                    101,
                    97,
                    109
                  ]
                },
                {
                  "kind": "account",
                  "path": "authority"
                }
              ]
            }
          },
          {
            "name": "authority",
            "writable": true,
            "signer": true
          },
          {
            "name": "systemProgram",
            "address": "11111111111111111111111111111111"
          }
        ],
        "args": [
          {
            "name": "receiver",
            "type": "pubkey"
          },
          {
            "name": "duration",
            "type": "i64"
          },
          {
            "name": "amount",
            "type": "u64"
          }
        ]
      },
      {
        "name": "initialize",
        "discriminator": [
          175,
          175,
          109,
          31,
          13,
          152,
          155,
          237
        ],
        "accounts": [
          {
            "name": "streamAccount",
            "writable": true,
            "pda": {
              "seeds": [
                {
                  "kind": "const",
                  "value": [
                    115,
                    116,
                    114,
                    101,
                    97,
                    109
                  ]
                },
                {
                  "kind": "account",
                  "path": "authority"
                }
              ]
            }
          },
          {
            "name": "authority",
            "writable": true,
            "signer": true
          },
          {
            "name": "systemProgram",
            "address": "11111111111111111111111111111111"
          }
        ],
        "args": []
      },
      {
        "name": "withdraw",
        "discriminator": [
          183,
          18,
          70,
          156,
          148,
          109,
          161,
          34
        ],
        "accounts": [
          {
            "name": "streamAccount",
            "writable": true,
            "pda": {
              "seeds": [
                {
                  "kind": "const",
                  "value": [
                    115,
                    116,
                    114,
                    101,
                    97,
                    109
                  ]
                },
                {
                  "kind": "account",
                  "path": "authority"
                }
              ]
            }
          },
          {
            "name": "authority",
            "signer": true
          },
          {
            "name": "receiver",
            "writable": true,
            "signer": true
          },
          {
            "name": "systemProgram",
            "address": "11111111111111111111111111111111"
          }
        ],
        "args": [
          {
            "name": "streamIndex",
            "type": "u64"
          }
        ]
      }
    ],
    "accounts": [
      {
        "name": "streamAccount",
        "discriminator": [
          243,
          60,
          164,
          106,
          199,
          192,
          110,
          53
        ]
      }
    ],
    "errors": [
      {
        "code": 6000,
        "name": "streamInactive",
        "msg": "The stream is inactive"
      },
      {
        "code": 6001,
        "name": "unauthorized",
        "msg": "Unauthorized access"
      }
    ],
    "types": [
      {
        "name": "stream",
        "type": {
          "kind": "struct",
          "fields": [
            {
              "name": "sender",
              "type": "pubkey"
            },
            {
              "name": "receiver",
              "type": "pubkey"
            },
            {
              "name": "startTime",
              "type": "i64"
            },
            {
              "name": "endTime",
              "type": "i64"
            },
            {
              "name": "amount",
              "type": "u64"
            },
            {
              "name": "withdrawnAmount",
              "type": "u64"
            },
            {
              "name": "isActive",
              "type": "bool"
            }
          ]
        }
      },
      {
        "name": "streamAccount",
        "type": {
          "kind": "struct",
          "fields": [
            {
              "name": "authority",
              "type": "pubkey"
            },
            {
              "name": "streamCount",
              "type": "u64"
            },
            {
              "name": "streams",
              "type": {
                "vec": {
                  "defined": {
                    "name": "stream"
                  }
                }
              }
            }
          ]
        }
      }
    ]
  };
  
  export const IDL: PaystreamMvp =  {
    "address": "GHsd2cgzpaoyFQ9hoQkhcXmAegbLaVh2zLFCjBFdotNn",
    "metadata": {
      "name": "paystreamMvp",
      "version": "0.1.0",
      "spec": "0.1.0",
      "description": "Created with Anchor"
    },
    "instructions": [
      {
        "name": "cancelStream",
        "discriminator": [
          218,
          221,
          38,
          25,
          177,
          207,
          188,
          91
        ],
        "accounts": [
          {
            "name": "streamAccount",
            "writable": true,
            "pda": {
              "seeds": [
                {
                  "kind": "const",
                  "value": [
                    115,
                    116,
                    114,
                    101,
                    97,
                    109
                  ]
                },
                {
                  "kind": "account",
                  "path": "authority"
                }
              ]
            }
          },
          {
            "name": "authority",
            "writable": true,
            "signer": true
          },
          {
            "name": "receiver",
            "writable": true
          },
          {
            "name": "systemProgram",
            "address": "11111111111111111111111111111111"
          }
        ],
        "args": [
          {
            "name": "streamIndex",
            "type": "u64"
          }
        ]
      },
      {
        "name": "createStream",
        "discriminator": [
          71,
          188,
          111,
          127,
          108,
          40,
          229,
          158
        ],
        "accounts": [
          {
            "name": "streamAccount",
            "writable": true,
            "pda": {
              "seeds": [
                {
                  "kind": "const",
                  "value": [
                    115,
                    116,
                    114,
                    101,
                    97,
                    109
                  ]
                },
                {
                  "kind": "account",
                  "path": "authority"
                }
              ]
            }
          },
          {
            "name": "authority",
            "writable": true,
            "signer": true
          },
          {
            "name": "systemProgram",
            "address": "11111111111111111111111111111111"
          }
        ],
        "args": [
          {
            "name": "receiver",
            "type": "pubkey"
          },
          {
            "name": "duration",
            "type": "i64"
          },
          {
            "name": "amount",
            "type": "u64"
          }
        ]
      },
      {
        "name": "initialize",
        "discriminator": [
          175,
          175,
          109,
          31,
          13,
          152,
          155,
          237
        ],
        "accounts": [
          {
            "name": "streamAccount",
            "writable": true,
            "pda": {
              "seeds": [
                {
                  "kind": "const",
                  "value": [
                    115,
                    116,
                    114,
                    101,
                    97,
                    109
                  ]
                },
                {
                  "kind": "account",
                  "path": "authority"
                }
              ]
            }
          },
          {
            "name": "authority",
            "writable": true,
            "signer": true
          },
          {
            "name": "systemProgram",
            "address": "11111111111111111111111111111111"
          }
        ],
        "args": []
      },
      {
        "name": "withdraw",
        "discriminator": [
          183,
          18,
          70,
          156,
          148,
          109,
          161,
          34
        ],
        "accounts": [
          {
            "name": "streamAccount",
            "writable": true,
            "pda": {
              "seeds": [
                {
                  "kind": "const",
                  "value": [
                    115,
                    116,
                    114,
                    101,
                    97,
                    109
                  ]
                },
                {
                  "kind": "account",
                  "path": "authority"
                }
              ]
            }
          },
          {
            "name": "authority",
            "signer": true
          },
          {
            "name": "receiver",
            "writable": true,
            "signer": true
          },
          {
            "name": "systemProgram",
            "address": "11111111111111111111111111111111"
          }
        ],
        "args": [
          {
            "name": "streamIndex",
            "type": "u64"
          }
        ]
      }
    ],
    "accounts": [
      {
        "name": "streamAccount",
        "discriminator": [
          243,
          60,
          164,
          106,
          199,
          192,
          110,
          53
        ]
      }
    ],
    "errors": [
      {
        "code": 6000,
        "name": "streamInactive",
        "msg": "The stream is inactive"
      },
      {
        "code": 6001,
        "name": "unauthorized",
        "msg": "Unauthorized access"
      }
    ],
    "types": [
      {
        "name": "stream",
        "type": {
          "kind": "struct",
          "fields": [
            {
              "name": "sender",
              "type": "pubkey"
            },
            {
              "name": "receiver",
              "type": "pubkey"
            },
            {
              "name": "startTime",
              "type": "i64"
            },
            {
              "name": "endTime",
              "type": "i64"
            },
            {
              "name": "amount",
              "type": "u64"
            },
            {
              "name": "withdrawnAmount",
              "type": "u64"
            },
            {
              "name": "isActive",
              "type": "bool"
            }
          ]
        }
      },
      {
        "name": "streamAccount",
        "type": {
          "kind": "struct",
          "fields": [
            {
              "name": "authority",
              "type": "pubkey"
            },
            {
              "name": "streamCount",
              "type": "u64"
            },
            {
              "name": "streams",
              "type": {
                "vec": {
                  "defined": {
                    "name": "stream"
                  }
                }
              }
            }
          ]
        }
      }
    ]
  };
  