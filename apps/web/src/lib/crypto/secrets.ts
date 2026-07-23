import { createCipheriv, createDecipheriv, createHash, randomBytes } from 'node:crypto';
// Server-only: importing node:crypto prevents this module from being bundled
// into any client component.

/**
 * Server-side secret encryption for BYOK settings. AES-256-GCM with a key
 * derived (sha256) from SETTINGS_ENCRYPTION_KEY so any-length env value works.
 * Ciphertext is stored as base64 "iv.tag.ciphertext"; plaintext of a sensitive
 * value never leaves the server.
 */
export class EncryptionNotConfiguredError extends Error {
  constructor() {
    super('SETTINGS_ENCRYPTION_KEY is not set — cannot store sensitive values.');
    this.name = 'EncryptionNotConfiguredError';
  }
}

export function encryptionConfigured(): boolean {
  return Boolean(process.env.SETTINGS_ENCRYPTION_KEY);
}

function key(): Buffer {
  const raw = process.env.SETTINGS_ENCRYPTION_KEY;
  if (!raw) throw new EncryptionNotConfiguredError();
  return createHash('sha256').update(raw).digest();
}

export function encryptSecret(plaintext: string): string {
  const iv = randomBytes(12);
  const cipher = createCipheriv('aes-256-gcm', key(), iv);
  const ct = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  return [iv.toString('base64'), tag.toString('base64'), ct.toString('base64')].join('.');
}

export function decryptSecret(payload: string): string {
  const [ivB64, tagB64, ctB64] = payload.split('.');
  if (!ivB64 || !tagB64 || !ctB64) throw new Error('malformed ciphertext');
  const decipher = createDecipheriv('aes-256-gcm', key(), Buffer.from(ivB64, 'base64'));
  decipher.setAuthTag(Buffer.from(tagB64, 'base64'));
  return Buffer.concat([decipher.update(Buffer.from(ctB64, 'base64')), decipher.final()]).toString(
    'utf8',
  );
}

/** A non-reversible preview so the UI can confirm a secret without exposing it. */
export function maskSecret(plaintext: string): string {
  if (plaintext.length <= 4) return '••••';
  const tail = plaintext.slice(-4);
  return `••••••••${tail}`;
}
