///@TODO: Use tape instead of pure js for tests, requires adding a package.json to manage to dependency
var segwit_addr = require('./segwit_addr.js');
var bech32 = require('./bech32');

function segwit_scriptpubkey(version, program) {
    return [version ? version + 0x80 : 0, program.length].concat(program);
}

var VALID_CHECKSUM = [
    "a12uel5l",
    "an83characterlonghumanreadablepartthatcontainsthenumber1andtheexcludedcharactersbio1tt5tgs",
    "abcdef1qpzry9x8gf2tvdw0s3jn54khce6mua7lmqqqxw",
    "11qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqc8247j",
    "split1checkupstagehandshakeupstreamerranterredcaperred2y9e3w"
];

var VALID_ADDRESS = [
    [
        "BC1QW508D6QEJXTDG4Y5R3ZARVARY0C5XW7KV8F3T4",
        [
            0x00, 0x14, 0x75, 0x1e, 0x76, 0xe8, 0x19, 0x91, 0x96, 0xd4, 0x54,
            0x94, 0x1c, 0x45, 0xd1, 0xb3, 0xa3, 0x23, 0xf1, 0x43, 0x3b, 0xd6
        ]
    ],
    [
        "tb1qrp33g0q5c5txsp9arysrx4k6zdkfs4nce4xj0gdcccefvpysxf3q0sl5k7",
        [
            0x00, 0x20, 0x18, 0x63, 0x14, 0x3c, 0x14, 0xc5, 0x16, 0x68, 0x04,
            0xbd, 0x19, 0x20, 0x33, 0x56, 0xda, 0x13, 0x6c, 0x98, 0x56, 0x78,
            0xcd, 0x4d, 0x27, 0xa1, 0xb8, 0xc6, 0x32, 0x96, 0x04, 0x90, 0x32,
            0x62
        ]
    ],
    [
        "bc1pw508d6qejxtdg4y5r3zarvary0c5xw7kw508d6qejxtdg4y5r3zarvary0c5xw7k7grplx",
        [
            0x81, 0x28, 0x75, 0x1e, 0x76, 0xe8, 0x19, 0x91, 0x96, 0xd4, 0x54,
            0x94, 0x1c, 0x45, 0xd1, 0xb3, 0xa3, 0x23, 0xf1, 0x43, 0x3b, 0xd6,
            0x75, 0x1e, 0x76, 0xe8, 0x19, 0x91, 0x96, 0xd4, 0x54, 0x94, 0x1c,
            0x45, 0xd1, 0xb3, 0xa3, 0x23, 0xf1, 0x43, 0x3b, 0xd6
        ]
    ],
    [
        "BC1SW50QA3JX3S",
        [
           0x90, 0x02, 0x75, 0x1e
        ]
    ],
    [
        "bc1zw508d6qejxtdg4y5r3zarvaryvg6kdaj",
        [
            0x82, 0x10, 0x75, 0x1e, 0x76, 0xe8, 0x19, 0x91, 0x96, 0xd4, 0x54,
            0x94, 0x1c, 0x45, 0xd1, 0xb3, 0xa3, 0x23
        ]
    ],
    [
        "tb1qqqqqp399et2xygdj5xreqhjjvcmzhxw4aywxecjdzew6hylgvsesrxh6hy",
        [
            0x00, 0x20, 0x00, 0x00, 0x00, 0xc4, 0xa5, 0xca, 0xd4, 0x62, 0x21,
            0xb2, 0xa1, 0x87, 0x90, 0x5e, 0x52, 0x66, 0x36, 0x2b, 0x99, 0xd5,
            0xe9, 0x1c, 0x6c, 0xe2, 0x4d, 0x16, 0x5d, 0xab, 0x93, 0xe8, 0x64,
            0x33
        ]
    ]
];

var INVALID_ADDRESS = [
    "tc1qw508d6qejxtdg4y5r3zarvary0c5xw7kg3g4ty",
    "bc1qw508d6qejxtdg4y5r3zarvary0c5xw7kv8f3t5",
    "BC13W508D6QEJXTDG4Y5R3ZARVARY0C5XW7KN40WF2",
    "bc1rw5uspcuh",
    "bc10w508d6qejxtdg4y5r3zarvary0c5xw7kw508d6qejxtdg4y5r3zarvary0c5xw7kw5rljs90",
    "BC1QR508D6QEJXTDG4Y5R3ZARVARYV98GJ9P",
    "tb1qrp33g0q5c5txsp9arysrx4k6zdkfs4nce4xj0gdcccefvpysxf3q0sI5k7",
    "tb1pw508d6qejxtdg4y5r3zarqfsj6c3",
    "tb1qrp33g0q5c5txsp9arysrx4k6zdkfs4nce4xj0gdcccefvpysxf3pjxtptv",
];

var didPassTests = true;

for (var p = 0; p < VALID_CHECKSUM.length; ++p) {
    var test = VALID_CHECKSUM[p];
    var ret = bech32.decode(test);
    didPassTests = didPassTests && !!ret;
    console.log("Valid checksum for " + test + ": " + (ret === null ? "fail" : "ok"));
}

for (var p = 0; p < VALID_ADDRESS.length; ++p) {
    var test = VALID_ADDRESS[p];
    var address = test[0];
    var scriptpubkey = test[1];
    var hrp = "bc";
    var ret = segwit_addr.decode(hrp, address);
    if (ret === null) {
        hrp = "tb";
        ret = segwit_addr.decode(hrp, address);
    }
    var ok = ret !== null;
    var output;
    if (ok) {
        output = segwit_scriptpubkey(ret.version, ret.program);
        ok = ("" + output == "" +scriptpubkey);
    }
    if (ok) {
        var recreate = segwit_addr.encode(hrp, ret.version, ret.program);
        ok = (recreate === address.toLowerCase());
    }
    didPassTests = didPassTests && !!ok;
    console.log("Valid address " + address + ": " + (ok ? "ok" : "FAIL"));
}

for (var p = 0; p < INVALID_ADDRESS.length; ++p) {
    var test = INVALID_ADDRESS[p];
    var ok = segwit_addr.decode("bc", test) === null && segwit_addr.decode("tb", test) === null;
    didPassTests = didPassTests && !!ok;
    console.log("Invalid address " + test + ": " + (ok ? "ok" : "FAIL"));
}

if (!didPassTests) {
    console.error();
    console.error('Failed tests');
    console.error();
    process.exit(1);
}
