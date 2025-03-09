"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PortalXAuth = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const util_1 = require("util");
const winston_1 = __importDefault(require("winston"));
const crypto = __importStar(require("crypto"));
const fs = __importStar(require("fs/promises"));
const path = __importStar(require("path"));
const logger = winston_1.default.createLogger({
    level: 'info',
    format: winston_1.default.format.simple(),
    transports: [
        new winston_1.default.transports.File({ filename: 'portalx.log' }),
        new winston_1.default.transports.Console()
    ]
});
const DB_FILE = path.join(process.cwd(), 'clients.json');
const SECRET_KEY = process.env.PORTALX_SECRET_KEY || 'your-secret-key-here'; // Replace with a secure key
class PortalXAuth {
    constructor() {
        this.data = { clients: [] };
    }
    async init() {
        try {
            const fileContent = await fs.readFile(DB_FILE, 'utf-8');
            this.data = JSON.parse(fileContent);
        }
        catch (error) {
            // File doesn't exist or is invalid, use default empty data
            this.data = { clients: [] };
            await this.saveData();
        }
    }
    async saveData() {
        await fs.writeFile(DB_FILE, JSON.stringify(this.data, null, 2));
    }
    async register(username, password) {
        await this.init();
        const clientExists = this.data.clients.some((c) => c.username === username);
        if (clientExists) {
            logger.warn(`Registration attempt failed: Username ${username} already exists`);
            throw new Error('Client already exists');
        }
        const hashedPassword = await this.hashPassword(password);
        this.data.clients.push({ username, password: hashedPassword });
        await this.saveData();
        logger.info(`New client registered: ${username}`);
        return this.login(username, password);
    }
    async login(username, password) {
        await this.init();
        const client = this.data.clients.find((c) => c.username === username);
        if (!client) {
            logger.warn(`Login attempt failed: Username ${username} not found`);
            throw new Error('Invalid credentials');
        }
        const isValid = await this.verifyPassword(password, client.password);
        if (!isValid) {
            logger.warn(`Login attempt failed: Invalid password for ${username}`);
            throw new Error('Invalid credentials');
        }
        const token = jsonwebtoken_1.default.sign({ username }, SECRET_KEY, { expiresIn: '1h' });
        logger.info(`Client logged in successfully: ${username}`);
        return token;
    }
    verifyToken(token) {
        try {
            jsonwebtoken_1.default.verify(token, SECRET_KEY);
            return true;
        }
        catch (error) {
            logger.warn('Token verification failed');
            return false;
        }
    }
    async hashPassword(password) {
        const salt = await (0, util_1.promisify)(crypto.randomBytes)(16);
        const hash = await (0, util_1.promisify)(crypto.pbkdf2)(password, salt, 100000, 64, 'sha512');
        return `${salt.toString('hex')}:${hash.toString('hex')}`;
    }
    async verifyPassword(password, hashedPassword) {
        const [salt, hash] = hashedPassword.split(':');
        const verifyHash = await (0, util_1.promisify)(crypto.pbkdf2)(password, Buffer.from(salt, 'hex'), 100000, 64, 'sha512');
        return verifyHash.toString('hex') === hash;
    }
}
exports.PortalXAuth = PortalXAuth;
