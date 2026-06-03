const SECRET = import.meta.env.VITE_HMAC_SECRET ?? '';

// Short-lived HMAC-TOTP token: HMAC-SHA256(secret, floor(Date.now()/30000)),
// hex-encoded, sent as the `x-app-token` header. Must match the Lambda's
// verification exactly (same secret string, same 30s window, same encoding).
export async function generateToken(): Promise<string> {
  if (!crypto?.subtle) {
    throw new Error(
      'Web Crypto unavailable — the app must run in a secure context (https:// or http://localhost).',
    );
  }
  const window = Math.floor(Date.now() / 30000);
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    enc.encode(SECRET),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const sig = await crypto.subtle.sign('HMAC', key, enc.encode(String(window)));
  return Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}
