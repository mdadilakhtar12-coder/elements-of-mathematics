// Single-password admin login. The password comes from the ADMIN_PASSWORD environment variable and is
// never stored in the repo. Sessions are signed cookies that expire after 8 hours.
import { createHash, createHmac, randomBytes, timingSafeEqual } from 'node:crypto';

const SESSION_MS = 8 * 60 * 60 * 1000;
const WINDOW_MS = 15 * 60 * 1000;
const MAX_ATTEMPTS = 5;

// A new random key on each start. Restarting the server logs admins out, which is acceptable here.
const KEY = randomBytes(32);
const attempts = new Map(); // ip -> { count, resetAt }

const digest = (s) => createHash('sha256').update(String(s)).digest();

export function passwordMatches(given, expected) {
  if (!expected) return false;
  return timingSafeEqual(digest(given ?? ''), digest(expected));
}

export function sign(payload) {
  return createHmac('sha256', KEY).update(payload).digest('base64url');
}

export function makeSession(now = Date.now()) {
  const payload = String(now + SESSION_MS);
  return `${payload}.${sign(payload)}`;
}

export function isValidSession(token, now = Date.now()) {
  if (typeof token !== 'string') return false;
  const [payload, sig] = token.split('.');
  if (!payload || !sig) return false;
  const expected = sign(payload);
  if (sig.length !== expected.length || !timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) return false;
  return Number(payload) > now;
}

// Returns true if this IP may try a password now. Counts failed attempts only.
export function canAttempt(ip, now = Date.now()) {
  const entry = attempts.get(ip);
  if (!entry || entry.resetAt <= now) return true;
  return entry.count < MAX_ATTEMPTS;
}

export function recordFailure(ip, now = Date.now()) {
  const entry = attempts.get(ip);
  if (!entry || entry.resetAt <= now) attempts.set(ip, { count: 1, resetAt: now + WINDOW_MS });
  else entry.count += 1;
}

export function clearFailures(ip) {
  attempts.delete(ip);
}

export function readCookie(header, name) {
  for (const part of (header || '').split(';')) {
    const [k, ...rest] = part.trim().split('=');
    if (k === name) return rest.join('=');
  }
  return null;
}

export const SESSION_COOKIE = 'sf_admin';
export const SESSION_SECONDS = SESSION_MS / 1000;
