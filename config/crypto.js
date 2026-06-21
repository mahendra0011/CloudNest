const crypto = require('crypto');

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;
const TAG_LENGTH = 16;

/**
 * Get encryption key from ENCRYPTION_KEY env var or use a derived key.
 * In production, always set ENCRYPTION_KEY as a 32-byte hex string.
 */
function getKey() {
    const envKey = process.env.ENCRYPTION_KEY;
    if (envKey && envKey.length >= 32) {
        return crypto.createHash('sha256').update(envKey).digest();
    }
    // Fallback (only for dev) - derive from JWT_SECRET
    return crypto.createHash('sha256').update(process.env.JWT_SECRET || 'dev-secret-key-12345').digest();
}

/**
 * Encrypt a plaintext string.
 * Returns hex-encoded: iv + authTag + ciphertext
 */
function encrypt(plaintext) {
    if (!plaintext) return '';
    const key = getKey();
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

    let encrypted = cipher.update(plaintext, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    const authTag = cipher.getAuthTag();

    // Prepend IV (16 bytes hex = 32 chars) + authTag (16 bytes hex = 32 chars)
    return iv.toString('hex') + authTag.toString('hex') + encrypted;
}

/**
 * Decrypt an encrypted string produced by encrypt().
 */
function decrypt(encryptedHex) {
    if (!encryptedHex) return '';
    try {
        const key = getKey();
        const iv = Buffer.from(encryptedHex.slice(0, 32), 'hex');
        const authTag = Buffer.from(encryptedHex.slice(32, 64), 'hex');
        const ciphertext = encryptedHex.slice(64);

        const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
        decipher.setAuthTag(authTag);

        let decrypted = decipher.update(ciphertext, 'hex', 'utf8');
        decrypted += decipher.final('utf8');
        return decrypted;
    } catch {
        return ''; // Return empty if decryption fails
    }
}

module.exports = { encrypt, decrypt };