import { cookies } from 'next/headers';

export const COOKIE_NAME = 'etechnix_admin';

const encoder = new TextEncoder();

async function getKey(): Promise<CryptoKey> {
  const secret = process.env.ADMIN_SECRET!;
  return crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify']
  );
}

export async function makeAdminToken(): Promise<string> {
  const payload = `admin:${Date.now()}`;
  const key = await getKey();
  const sig = await crypto.subtle.sign('HMAC', key, encoder.encode(payload));
  const sigHex = Array.from(new Uint8Array(sig)).map(b => b.toString(16).padStart(2, '0')).join('');
  return Buffer.from(`${payload}:${sigHex}`).toString('base64');
}

export async function verifyAdminToken(token: string): Promise<boolean> {
  try {
    const decoded = Buffer.from(token, 'base64').toString('utf8');
    const lastColon = decoded.lastIndexOf(':');
    const payload = decoded.slice(0, lastColon);
    const sigHex = decoded.slice(lastColon + 1);
    const sigBytes = new Uint8Array(sigHex.match(/.{2}/g)!.map(b => parseInt(b, 16)));
    const key = await getKey();
    return crypto.subtle.verify('HMAC', key, sigBytes, encoder.encode(payload));
  } catch {
    return false;
  }
}

export async function isAdminAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return false;
  return verifyAdminToken(token);
}
