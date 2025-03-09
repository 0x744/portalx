"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PortalXEncryption = void 0;
const buffer_1 = require("buffer");
const crypto_1 = require("crypto");
class PortalXEncryption {
    static async encrypt(text, key) {
        const iv = (0, crypto_1.randomBytes)(this.IV_LENGTH);
        const salt = (0, crypto_1.randomBytes)(this.SALT_LENGTH);
        const cipher = (0, crypto_1.createCipheriv)(this.ALGORITHM, buffer_1.Buffer.from(key), iv);
        let encrypted = cipher.update(text, 'utf8', 'hex');
        encrypted += cipher.final('hex');
        const tag = cipher.getAuthTag();
        return buffer_1.Buffer.concat([salt, iv, tag, buffer_1.Buffer.from(encrypted, 'hex')]).toString('base64');
    }
    static async decrypt(encryptedText, key) {
        const buffer = buffer_1.Buffer.from(encryptedText, 'base64');
        const salt = buffer.slice(0, this.SALT_LENGTH);
        const iv = buffer.slice(this.SALT_LENGTH, this.SALT_LENGTH + this.IV_LENGTH);
        const tag = buffer.slice(this.SALT_LENGTH + this.IV_LENGTH, this.SALT_LENGTH + this.IV_LENGTH + this.TAG_LENGTH);
        const encrypted = buffer.slice(this.SALT_LENGTH + this.IV_LENGTH + this.TAG_LENGTH);
        const decipher = (0, crypto_1.createDecipheriv)(this.ALGORITHM, buffer_1.Buffer.from(key), iv);
        decipher.setAuthTag(tag);
        let decrypted = decipher.update(encrypted);
        decrypted = buffer_1.Buffer.concat([decrypted, decipher.final()]);
        return decrypted.toString('utf8');
    }
}
exports.PortalXEncryption = PortalXEncryption;
PortalXEncryption.ALGORITHM = 'aes-256-gcm';
PortalXEncryption.IV_LENGTH = 16;
PortalXEncryption.SALT_LENGTH = 64;
PortalXEncryption.TAG_LENGTH = 16;
