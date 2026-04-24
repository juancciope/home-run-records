import { createCipheriv, createDecipheriv, randomBytes } from 'node:crypto';

const KEY_B64 = process.env.META_ADS_ENCRYPTION_KEY!;

function getKey(): Buffer {
  const key = Buffer.from(KEY_B64, 'base64');
  if (key.length !== 32) {
    throw new Error('META_ADS_ENCRYPTION_KEY must be 32 bytes (base64 of 32 random bytes)');
  }
  return key;
}

export function encrypt(plain: string): string {
  const iv = randomBytes(12);
  const cipher = createCipheriv('aes-256-gcm', getKey(), iv);
  const enc = Buffer.concat([cipher.update(plain, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  return `${iv.toString('base64')}:${tag.toString('base64')}:${enc.toString('base64')}`;
}

export function decrypt(payload: string): string {
  const [ivB64, tagB64, encB64] = payload.split(':');
  const decipher = createDecipheriv('aes-256-gcm', getKey(), Buffer.from(ivB64, 'base64'));
  decipher.setAuthTag(Buffer.from(tagB64, 'base64'));
  const dec = Buffer.concat([decipher.update(Buffer.from(encB64, 'base64')), decipher.final()]);
  return dec.toString('utf8');
}
