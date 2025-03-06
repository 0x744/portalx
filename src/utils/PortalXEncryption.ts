import { Buffer } from 'buffer';
import { createCipheriv, createDecipheriv, randomBytes } from 'crypto';

export class PortalXEncryption {
  private static readonly ALGORITHM = 'aes-256-gcm';
  private static readonly IV_LENGTH = 16;
  private static readonly SALT_LENGTH = 64;
  private static readonly TAG_LENGTH = 16;

  static async encrypt(text: string, key: string): Promise<string> {
    const iv = randomBytes(this.IV_LENGTH);
    const salt = randomBytes(this.SALT_LENGTH);
    const cipher = createCipheriv(this.ALGORITHM, Buffer.from(key), iv);
    
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    const tag = cipher.getAuthTag();
    
    return Buffer.concat([salt, iv, tag, Buffer.from(encrypted, 'hex')]).toString('base64');
  }

  static async decrypt(encryptedText: string, key: string): Promise<string> {
    const buffer = Buffer.from(encryptedText, 'base64');
    const salt = buffer.slice(0, this.SALT_LENGTH);
    const iv = buffer.slice(this.SALT_LENGTH, this.SALT_LENGTH + this.IV_LENGTH);
    const tag = buffer.slice(this.SALT_LENGTH + this.IV_LENGTH, this.SALT_LENGTH + this.IV_LENGTH + this.TAG_LENGTH);
    const encrypted = buffer.slice(this.SALT_LENGTH + this.IV_LENGTH + this.TAG_LENGTH);
    
    const decipher = createDecipheriv(this.ALGORITHM, Buffer.from(key), iv);
    decipher.setAuthTag(tag);
    
    let decrypted = decipher.update(encrypted);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    
    return decrypted.toString('utf8');
  }
} 