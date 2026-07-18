import { beforeAll, describe, expect, it } from "vitest";
import { decryptSecret, encryptSecret } from "./crypto";

beforeAll(() => {
  process.env.ENCRYPTION_KEY = "0".repeat(64);
});

describe("encryptSecret / decryptSecret", () => {
  it("round-trips a plain text secret", () => {
    const plain = "sk-ant-super-secret-key";
    const encrypted = encryptSecret(plain);
    expect(encrypted).not.toContain(plain);
    expect(decryptSecret(encrypted)).toBe(plain);
  });

  it("produces a different ciphertext each time (random IV)", () => {
    const a = encryptSecret("same-value");
    const b = encryptSecret("same-value");
    expect(a).not.toBe(b);
  });

  it("throws on a tampered payload", () => {
    const encrypted = encryptSecret("value");
    const tampered = encrypted.slice(0, -2) + "ff";
    expect(() => decryptSecret(tampered)).toThrow();
  });
});
