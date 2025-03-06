import { Keypair } from '@solana/web3.js';

interface WalletData {
  publicKey: string;
  privateKey: string;
  createdAt: number;
}

self.onmessage = async (e: MessageEvent) => {
  const { count } = e.data;
  
  try {
    const wallets: WalletData[] = [];
    for (let i = 0; i < count; i++) {
      const keypair = Keypair.generate();
      wallets.push({
        publicKey: keypair.publicKey.toString(),
        privateKey: Buffer.from(keypair.secretKey).toString('hex'),
        createdAt: Date.now()
      });
    }
    
    self.postMessage(wallets);
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    self.postMessage({ error: errorMessage });
  }
}; 