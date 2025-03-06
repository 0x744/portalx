import jwt from 'jsonwebtoken';
import { promisify } from 'util';
import winston from 'winston';
import * as crypto from 'crypto';
import * as fs from 'fs/promises';
import * as path from 'path';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.simple(),
  transports: [
    new winston.transports.File({ filename: 'portalx.log' }),
    new winston.transports.Console()
  ]
});

interface ClientData {
  clients: Array<{
    username: string;
    password: string;
  }>;
}

const DB_FILE = path.join(process.cwd(), 'clients.json');
const SECRET_KEY = process.env.PORTALX_SECRET_KEY || 'your-secret-key-here'; // Replace with a secure key

export class PortalXAuth {
  private data: ClientData = { clients: [] };

  async init() {
    try {
      const fileContent = await fs.readFile(DB_FILE, 'utf-8');
      this.data = JSON.parse(fileContent);
    } catch (error) {
      // File doesn't exist or is invalid, use default empty data
      this.data = { clients: [] };
      await this.saveData();
    }
  }

  private async saveData() {
    await fs.writeFile(DB_FILE, JSON.stringify(this.data, null, 2));
  }

  async register(username: string, password: string) {
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

  async login(username: string, password: string): Promise<string> {
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

    const token = jwt.sign({ username }, SECRET_KEY, { expiresIn: '1h' });
    logger.info(`Client logged in successfully: ${username}`);
    return token;
  }

  verifyToken(token: string): boolean {
    try {
      jwt.verify(token, SECRET_KEY);
      return true;
    } catch (error) {
      logger.warn('Token verification failed');
      return false;
    }
  }

  private async hashPassword(password: string): Promise<string> {
    const salt = await promisify(crypto.randomBytes)(16);
    const hash = await promisify(crypto.pbkdf2)(
      password,
      salt,
      100000,
      64,
      'sha512'
    );
    return `${salt.toString('hex')}:${hash.toString('hex')}`;
  }

  private async verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
    const [salt, hash] = hashedPassword.split(':');
    const verifyHash = await promisify(crypto.pbkdf2)(
      password,
      Buffer.from(salt, 'hex'),
      100000,
      64,
      'sha512'
    );
    return verifyHash.toString('hex') === hash;
  }
} 