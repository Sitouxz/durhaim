const DEFAULT_PASSWORD_ITERATIONS = 210000;
const encoder = new TextEncoder();

function bytesToBase64(bytes: Uint8Array) {
  let binary = '';
  for (let index = 0; index < bytes.length; index += 1) {
    binary += String.fromCharCode(bytes[index]);
  }
  return btoa(binary);
}

function base64ToBytes(value: string) {
  const binary = atob(value);
  return Uint8Array.from(binary, (char) => char.charCodeAt(0));
}

async function derivePasswordHash(password: string, salt: Uint8Array, iterations: number) {
  const saltCopy = new Uint8Array(salt.length);
  saltCopy.set(salt);
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(password),
    'PBKDF2',
    false,
    ['deriveBits'],
  );

  const bits = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      hash: 'SHA-256',
      salt: saltCopy.buffer,
      iterations,
    },
    key,
    256,
  );

  return new Uint8Array(bits);
}

function constantTimeEqual(a: Uint8Array, b: Uint8Array) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let index = 0; index < a.length; index += 1) {
    diff |= a[index] ^ b[index];
  }
  return diff === 0;
}

export async function hashAdminPassword(password: string, iterations = DEFAULT_PASSWORD_ITERATIONS) {
  const salt = new Uint8Array(16);
  crypto.getRandomValues(salt);
  const hash = await derivePasswordHash(password, salt, iterations);

  return {
    password_hash: bytesToBase64(hash),
    password_salt: bytesToBase64(salt),
    password_iterations: iterations,
    password_updated_at: new Date().toISOString(),
  };
}

export async function verifyAdminPasswordHash(
  password: string,
  password_hash?: string | null,
  password_salt?: string | null,
  password_iterations?: number | null,
) {
  if (!password_hash || !password_salt || !password_iterations) return false;
  const expected = base64ToBytes(password_hash);
  const actual = await derivePasswordHash(password, base64ToBytes(password_salt), password_iterations);
  return constantTimeEqual(actual, expected);
}
