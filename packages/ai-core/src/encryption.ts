import { createCipheriv, createDecipheriv, randomBytes } from "crypto";

const ALGORITHM = "aes-256-gcm";

export interface EncryptedData {
  encrypted: string;
  iv: string;
  authTag: string;
}

export function encryptApiKey(plaintext: string, encryptionKey: Buffer): EncryptedData {
  const iv = randomBytes(16);
  const cipher = createCipheriv(ALGORITHM, encryptionKey, iv);
  let encrypted = cipher.update(plaintext, "utf8", "hex");
  encrypted += cipher.final("hex");
  const authTag = cipher.getAuthTag().toString("hex");
  return {
    encrypted,
    iv: iv.toString("hex"),
    authTag,
  };
}

export function decryptApiKey(data: EncryptedData, encryptionKey: Buffer): string {
  const decipher = createDecipheriv(ALGORITHM, encryptionKey, Buffer.from(data.iv, "hex"));
  decipher.setAuthTag(Buffer.from(data.authTag, "hex"));
  let decrypted = decipher.update(data.encrypted, "hex", "utf8");
  decrypted += decipher.final("utf8");
  return decrypted;
}
