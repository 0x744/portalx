"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("@testing-library/jest-dom");
const vitest_1 = require("vitest");
// Mock electron-store
vitest_1.vi.mock('electron-store', () => {
    return {
        default: vitest_1.vi.fn().mockImplementation(() => ({
            get: vitest_1.vi.fn(),
            set: vitest_1.vi.fn(),
        })),
    };
});
// Mock crypto
vitest_1.vi.mock('crypto', () => ({
    randomBytes: vitest_1.vi.fn().mockReturnValue(Buffer.from('test-iv')),
    createCipheriv: vitest_1.vi.fn().mockReturnValue({
        update: vitest_1.vi.fn().mockReturnValue('encrypted'),
        final: vitest_1.vi.fn().mockReturnValue(''),
        getAuthTag: vitest_1.vi.fn().mockReturnValue(Buffer.from('test-tag')),
    }),
    createDecipheriv: vitest_1.vi.fn().mockReturnValue({
        update: vitest_1.vi.fn().mockReturnValue('decrypted'),
        final: vitest_1.vi.fn().mockReturnValue(''),
        setAuthTag: vitest_1.vi.fn(),
    }),
}));
// Mock environment variables
process.env.ENCRYPTION_KEY = 'test-encryption-key';
process.env.STORE_ENCRYPTION_KEY = 'test-store-key';
