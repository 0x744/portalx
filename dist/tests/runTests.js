"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const PortalXTestRunner_1 = require("./PortalXTestRunner");
const winston_1 = __importDefault(require("winston"));
const logger = winston_1.default.createLogger({
    level: 'info',
    format: winston_1.default.format.combine(winston_1.default.format.timestamp(), winston_1.default.format.json()),
    transports: [
        new winston_1.default.transports.File({ filename: 'test-error.log', level: 'error' }),
        new winston_1.default.transports.File({ filename: 'test-combined.log' }),
        new winston_1.default.transports.Console()
    ]
});
async function main() {
    try {
        logger.info('Starting PortalX test suite');
        const runner = new PortalXTestRunner_1.PortalXTestRunner();
        await runner.runAllTests();
        logger.info('PortalX test suite completed successfully');
    }
    catch (error) {
        logger.error('PortalX test suite failed:', error);
        process.exit(1);
    }
}
main();
