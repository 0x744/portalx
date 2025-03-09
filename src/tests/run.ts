import { Connection } from '@solana/web3.js';
import { PortalXTestRunner } from './PortalXTestRunner';
import { PortalXWalletManager } from '../utils/PortalXWalletManager';
import { PortalXTokenSniper } from '../utils/PortalXTokenSniper';
import { PortalXBlockchainClient } from '../utils/PortalXBlockchainClient';
import { TestResult } from './PortalXTestConfig';

async function main() {
  try {
    // Initialize connection and managers
    const connection = new Connection('https://api.devnet.solana.com');
    const walletManager = new PortalXWalletManager();
    const client = new PortalXBlockchainClient(['https://api.devnet.solana.com']);
    const sniper = new PortalXTokenSniper(client);

    // Create test runner
    const runner = new PortalXTestRunner(connection, walletManager, sniper);

    // Run tests
    const results = await runner.runTests();

    // Debug log the first result
    if (results.length > 0) {
      console.log('First test result structure:', JSON.stringify(results[0], null, 2));
    }

    // Log results
    console.log('\nTest Results:');
    for (const result of results) {
      console.log(`\n${result.feature} - ${result.test}:`);
      console.log(`Status: ${result.status === 'success' ? 'PASSED' : 'FAILED'}`);
      if (result.error) {
        console.log(`Error: ${result.error}`);
      }
      if (result.details) {
        console.log('Details:', JSON.stringify(result.details, null, 2));
      }
    }

    // Exit with appropriate code
    const allPassed = results.every((result: TestResult) => result.status === 'success');
    process.exit(allPassed ? 0 : 1);
  } catch (error) {
    console.error('Error running tests:', error);
    process.exit(1);
  }
}

main(); 