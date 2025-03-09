"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const web3_js_1 = require("@solana/web3.js");
self.onmessage = (e) => {
    const count = e.data.count;
    const wallets = Array(count).fill(null).map(() => {
        const keypair = web3_js_1.Keypair.generate();
        return {
            publicKey: keypair.publicKey.toString(),
            privateKey: Buffer.from(keypair.secretKey).toString('base64')
        };
    });
    self.postMessage(wallets);
};
