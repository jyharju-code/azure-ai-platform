import { encryptApiKey, decryptApiKey } from "@repo/ai-core";

function getEncryptionKey(): Buffer {
  const key = process.env.ENCRYPTION_KEY;
  if (!key) {
    throw new Error("ENCRYPTION_KEY environment variable is required");
  }
  return Buffer.from(key, "hex");
}

export function encrypt(plaintext: string) {
  return encryptApiKey(plaintext, getEncryptionKey());
}

export function decrypt(data: { encrypted: string; iv: string; authTag: string }) {
  return decryptApiKey(data, getEncryptionKey());
}
