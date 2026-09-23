import crypto from 'crypto';
import { config } from '../config';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;
const TAG_LENGTH = 16;

/**
 * Encrypt sensitive data using AES-256-GCM
 */
export function encrypt(plaintext: string): {
  encrypted: string;
  iv: string;
  tag: string;
} {
  // Generate random IV
  const iv = crypto.randomBytes(IV_LENGTH);

  // Get encryption key from environment
  const key = Buffer.from(config.encryption.key, 'base64');

  // Create cipher
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

  // Encrypt
  let encrypted = cipher.update(plaintext, 'utf8', 'hex');
  encrypted += cipher.final('hex');

  // Get authentication tag
  const tag = cipher.getAuthTag();

  return {
    encrypted,
    iv: iv.toString('hex'),
    tag: tag.toString('hex'),
  };
}

/**
 * Decrypt data encrypted with AES-256-GCM
 */
export function decrypt(
  encrypted: string,
  ivHex: string,
  tagHex: string
): string {
  try {
    // Convert from hex
    const iv = Buffer.from(ivHex, 'hex');
    const tag = Buffer.from(tagHex, 'hex');

    // Get encryption key from environment
    const key = Buffer.from(config.encryption.key, 'base64');

    // Create decipher
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(tag);

    // Decrypt
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  } catch (error) {
    throw new Error('Decryption failed: Invalid encrypted data or key');
  }
}

/**
 * Generate a secure random token
 */
export function generateToken(length: number = 32): string {
  return crypto.randomBytes(length).toString('hex');
}

/**
 * Hash a value (for tokens, not passwords)
 */
export function hashValue(value: string): string {
  return crypto.createHash('sha256').update(value).digest('hex');
}

/**
 * Mask sensitive value for display (show only last 4 chars)
 */
export function maskApiKey(apiKey: string): string {
  if (!apiKey || apiKey.length < 8) {
    return '••••••••';
  }
  const visibleChars = apiKey.slice(-4);
  return '••••••••••••' + visibleChars;
}
