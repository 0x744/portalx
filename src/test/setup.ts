import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock electron-store
vi.mock('electron-store', () => {
  return {
    default: vi.fn().mockImplementation(() => ({
      get: vi.fn(),
      set: vi.fn(),
    })),
  };
});

// Mock crypto
vi.mock('crypto', () => ({
  randomBytes: vi.fn().mockReturnValue(Buffer.from('test-iv')),
  createCipheriv: vi.fn().mockReturnValue({
    update: vi.fn().mockReturnValue('encrypted'),
    final: vi.fn().mockReturnValue(''),
    getAuthTag: vi.fn().mockReturnValue(Buffer.from('test-tag')),
  }),
  createDecipheriv: vi.fn().mockReturnValue({
    update: vi.fn().mockReturnValue('decrypted'),
    final: vi.fn().mockReturnValue(''),
    setAuthTag: vi.fn(),
  }),
}));

// Mock environment variables
process.env.ENCRYPTION_KEY = 'test-encryption-key';
process.env.STORE_ENCRYPTION_KEY = 'test-store-key'; 