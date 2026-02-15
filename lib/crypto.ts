import { createCipheriv, createDecipheriv, randomBytes, scryptSync } from "crypto";

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 12;
const TAG_LENGTH = 16;

function getKey() {
  const secret = process.env.ENCRYPTION_SECRET;
  if (!secret) {
    throw new Error("Missing ENCRYPTION_SECRET environment variable.");
  }

  return scryptSync(secret, "pterodactyl-dashboard-salt", 32);
}

export function encryptApiKey(plainText: string): string {
  const iv = randomBytes(IV_LENGTH);
  const key = getKey();

  const cipher = createCipheriv(ALGORITHM, key, iv, { authTagLength: TAG_LENGTH });
  const encrypted = Buffer.concat([cipher.update(plainText, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();

  return `${iv.toString("hex")}:${tag.toString("hex")}:${encrypted.toString("hex")}`;
}

export function decryptApiKey(cipherText: string): string {
  const [ivHex, tagHex, dataHex] = cipherText.split(":");

  if (!ivHex || !tagHex || !dataHex) {
    throw new Error("Invalid encrypted API key format.");
  }

  const key = getKey();
  const decipher = createDecipheriv(ALGORITHM, key, Buffer.from(ivHex, "hex"), {
    authTagLength: TAG_LENGTH
  });
  decipher.setAuthTag(Buffer.from(tagHex, "hex"));

  const decrypted = Buffer.concat([
    decipher.update(Buffer.from(dataHex, "hex")),
    decipher.final()
  ]);

  return decrypted.toString("utf8");
}
