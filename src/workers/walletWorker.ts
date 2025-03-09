import { Keypair } from '@solana/web3.js';

self.onmessage = (e: MessageEvent) => {
  const count = e.data.count;
  const wallets = Array(count).fill(null).map(() => {
    const keypair = Keypair.generate();
    return {
      publicKey: keypair.publicKey.toString(),
      privateKey: Buffer.from(keypair.secretKey).toString('base64')
    };
  });
  self.postMessage(wallets);
}; 