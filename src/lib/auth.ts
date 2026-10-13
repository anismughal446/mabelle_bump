import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

const JWT_SECRET = process.env.JWT_SECRET || "bumpstyle-dev-secret-change-me";
const COOKIE_NAME = "bumpstyle_token";

export type SessionUser = {
  id: number;
  name: string;
  email: string;
  role: string;
};

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}

export function signToken(payload: SessionUser) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
}

export function verifyToken(token: string): SessionUser | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as SessionUser & { iat: number; exp: number };
    return { id: decoded.id, name: decoded.name, email: decoded.email, role: decoded.role };
  } catch {
    return null;
  }
}

export async function setAuthCookie(token: string) {
  const store = await cookies();
  store.set(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
}

export async function clearAuthCookie() {
  const store = await cookies();
  store.delete(COOKIE_NAME);
}

export async function getSession(): Promise<SessionUser | null> {
  const store = await cookies();
  const token = store.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return verifyToken(token);
}

/** Returns the fully-loaded user record, or null. */
export async function getCurrentUser() {
  const session = await getSession();
  if (!session) return null;
  const rows = await db.select().from(users).where(eq(users.id, session.id)).limit(1);
  return rows[0] ?? null;
}

export async function requireRole(roles: string[]) {
  const session = await getSession();
  if (!session || !roles.includes(session.role)) return null;
  return session;
}
