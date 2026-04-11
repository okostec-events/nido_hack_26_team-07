import {
  randomBytes,
  randomUUID,
  scryptSync,
  timingSafeEqual,
} from "node:crypto";
import {
  createError,
  deleteCookie,
  getCookie,
  setCookie,
  type H3Event,
} from "h3";
import { ensureSchema, getDb } from "./db";

const SESSION_COOKIE_NAME = "brj_session";
const SESSION_DURATION_MS = 1000 * 60 * 60 * 24 * 14;

export type AuthUser = {
  id: string;
  email: string;
  name: string;
  arrivalMonth: string;
};

type SessionRow = {
  id: string;
  email: string;
  name: string;
  arrival_month: string;
};

export const normalizeEmail = (value: string): string =>
  value.trim().toLowerCase();

export const hashPassword = (password: string): string => {
  const salt = randomBytes(16).toString("hex");
  const hashed = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hashed}`;
};

export const verifyPassword = (
  password: string,
  storedPasswordHash: string,
): boolean => {
  const [salt, knownHash] = storedPasswordHash.split(":");
  if (!salt || !knownHash) {
    return false;
  }

  const candidateHash = scryptSync(password, salt, 64).toString("hex");
  const knownBuffer = Buffer.from(knownHash, "hex");
  const candidateBuffer = Buffer.from(candidateHash, "hex");

  if (knownBuffer.length !== candidateBuffer.length) {
    return false;
  }

  return timingSafeEqual(knownBuffer, candidateBuffer);
};

const setSessionCookie = (
  event: H3Event,
  token: string,
  expiresAt: Date,
): void => {
  setCookie(event, SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: expiresAt,
  });
};

export const clearSessionCookie = (event: H3Event): void => {
  deleteCookie(event, SESSION_COOKIE_NAME, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
  });
};

const sessionTokenFromCookie = (event: H3Event): string | null => {
  const token = getCookie(event, SESSION_COOKIE_NAME);
  return token && token.length > 0 ? token : null;
};

export const createSessionForUser = async (
  event: H3Event,
  userId: string,
): Promise<void> => {
  await ensureSchema();
  const db = getDb();

  const token = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + SESSION_DURATION_MS);

  await db`
    INSERT INTO auth_sessions (token, user_id, expires_at)
    VALUES (${token}, ${userId}, ${expiresAt.toISOString()})
  `;

  setSessionCookie(event, token, expiresAt);
};

export const destroySession = async (event: H3Event): Promise<void> => {
  await ensureSchema();
  const db = getDb();
  const token = sessionTokenFromCookie(event);

  if (token) {
    await db`
      DELETE FROM auth_sessions
      WHERE token = ${token}
    `;
  }

  clearSessionCookie(event);
};

const toAuthUser = (row: SessionRow): AuthUser => ({
  id: row.id,
  email: row.email,
  name: row.name,
  arrivalMonth: row.arrival_month,
});

export const getCurrentUser = async (
  event: H3Event,
): Promise<AuthUser | null> => {
  await ensureSchema();
  const db = getDb();
  const token = sessionTokenFromCookie(event);

  if (!token) {
    return null;
  }

  const rows = await db<SessionRow[]>`
    SELECT u.id, u.email, p.name, p.arrival_month
    FROM auth_sessions s
    INNER JOIN users u ON u.id = s.user_id
    INNER JOIN user_profiles p ON p.user_id = u.id
    WHERE s.token = ${token}
      AND s.expires_at > NOW()
    LIMIT 1
  `;

  if (rows.length === 0) {
    clearSessionCookie(event);
    return null;
  }

  return toAuthUser(rows[0]);
};

export const requireUser = async (event: H3Event): Promise<AuthUser> => {
  const user = await getCurrentUser(event);

  if (!user) {
    throw createError({
      statusCode: 401,
      statusMessage: "Authentication required",
    });
  }

  return user;
};

export const createUserId = (): string => randomUUID();
