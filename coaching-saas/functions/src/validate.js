'use strict';
/** Pure helpers (no Firebase): input validation and the login-email convention. */

/** Fake mail domain used only to give every (institute, username) pair a unique Firebase Auth identity. Never mailed. */
const LOGIN_DOMAIN = 'login.coachsaas.app';

const CODE_RE = /^[a-z0-9][a-z0-9-]{2,23}$/; // institute code: 3-24 chars, lowercase, digits, hyphen
const USERNAME_RE = /^[a-z0-9][a-z0-9._-]{1,39}$/; // 2-40 chars
const RESERVED_CODES = new Set(['admin', 'api', 'app', 'www', 'super', 'superadmin', 'coachsaas', 'test', 'demo', 'null', 'undefined']);

function normCode(s) {
  return String(s ?? '').trim().toLowerCase();
}
function normUsername(s) {
  return String(s ?? '').trim().toLowerCase().replace(/\s+/g, '');
}

function validateCode(code) {
  const c = normCode(code);
  if (!CODE_RE.test(c)) return 'Institute code must be 3-24 characters: letters, digits or "-".';
  if (RESERVED_CODES.has(c)) return 'This institute code is reserved. Please choose another.';
  return null;
}

function validateUsername(u) {
  const x = normUsername(u);
  if (!USERNAME_RE.test(x)) return 'Username must be 2-40 characters: letters, digits, ".", "_" or "-".';
  return null;
}

function validatePassword(p) {
  if (typeof p !== 'string' || p.length < 8) return 'Password must be at least 8 characters.';
  if (p.length > 100) return 'Password is too long.';
  return null;
}

/** The Firebase Auth e-mail behind "institute code + username". */
function loginEmail(code, username) {
  return `${normUsername(username)}@${normCode(code)}.${LOGIN_DOMAIN}`;
}

/** Cryptographically random temporary password (no look-alike characters). */
function randomPassword(length = 10, rand = require('node:crypto').randomInt) {
  const chars = 'abcdefghjkmnpqrstuvwxyzABCDEFGHJKMNPQRSTUVWXYZ23456789';
  let out = '';
  for (let i = 0; i < length; i++) out += chars[rand(chars.length)];
  return out;
}

/** Who may create which role. Owner/admin: everyone. Sub-admin with "users" permission: teachers and students only. */
function canManageRole(caller, targetRole) {
  if (!caller) return false;
  if (caller.role === 'admin') return true;
  if (caller.role === 'subadmin') {
    return (caller.perms || []).includes('users') && (targetRole === 'student' || targetRole === 'teacher');
  }
  return false;
}

const SUBADMIN_PERMS = ['users', 'batches', 'schedule', 'attendance', 'exams', 'fees', 'notices'];

/** Profile fields a caller may set when creating an account (everything else is ignored). */
function pickProfile(input, role) {
  const s = (v, max = 200) => String(v ?? '').trim().slice(0, max);
  const n = (v) => (Number.isFinite(Number(v)) && Number(v) >= 0 ? Math.round(Number(v)) : 0);
  const base = { name: s(input.name, 100), mobile: s(input.mobile, 20) };
  if (role === 'subadmin') {
    const perms = Array.isArray(input.perms) ? input.perms.filter((p) => SUBADMIN_PERMS.includes(p)) : [];
    return { ...base, perms };
  }
  if (role === 'teacher') {
    return {
      ...base,
      subjects: s(input.subjects),
      classRate: n(input.classRate),
      salary: n(input.salary),
      teacherType: ['permanent', 'guest'].includes(input.teacherType) ? input.teacherType : '',
    };
  }
  if (role === 'student') {
    return {
      ...base,
      batchIds: Array.isArray(input.batchIds) ? input.batchIds.map((b) => s(b, 60)).slice(0, 50) : [],
      rollNo: s(input.rollNo, 20),
      standard: s(input.standard, 40),
      parentMobile: s(input.parentMobile, 20),
      monthlyFee: n(input.monthlyFee),
    };
  }
  return base;
}

module.exports = {
  LOGIN_DOMAIN, SUBADMIN_PERMS,
  normCode, normUsername, validateCode, validateUsername, validatePassword,
  loginEmail, randomPassword, canManageRole, pickProfile,
};
