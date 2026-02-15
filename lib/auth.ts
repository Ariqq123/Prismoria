import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createHmac, timingSafeEqual } from "crypto";

const SESSION_COOKIE = "admin_session";
const ONE_WEEK = 60 * 60 * 24 * 7;

function isAuthBypassed() {
  return process.env.DISABLE_AUTH === "true";
}

export function getAdminEmail() {
  return process.env.ADMIN_EMAIL ?? "admin@gmail.com";
}

function getSessionSecret() {
  const secret = process.env.SESSION_SECRET;
  if (!secret) {
    throw new Error("Missing SESSION_SECRET environment variable.");
  }

  return secret;
}

function signValue(value: string): string {
  return createHmac("sha256", getSessionSecret()).update(value).digest("hex");
}

export async function verifyAdminCredentials(email: string, password: string): Promise<boolean> {
  const expectedEmail = getAdminEmail();
  const expectedHash = process.env.ADMIN_PASSWORD_HASH;

  if (email !== expectedEmail) {
    return false;
  }

  if (expectedHash) {
    return bcrypt.compare(password, expectedHash);
  }

  return password === (process.env.ADMIN_PASSWORD ?? "admin123");
}

export function createSessionCookie(email: string) {
  if (isAuthBypassed()) {
    return;
  }

  const payload = `${email}.${signValue(email)}`;

  cookies().set(SESSION_COOKIE, payload, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: ONE_WEEK
  });
}

export function clearSessionCookie() {
  cookies().delete(SESSION_COOKIE);
}

export function isAuthenticated(): boolean {
  if (isAuthBypassed()) {
    return true;
  }

  const expectedEmail = getAdminEmail();
  const value = cookies().get(SESSION_COOKIE)?.value;

  if (!value) {
    return false;
  }

  const [email, signature] = value.split(".");
  if (!email || !signature || email !== expectedEmail) {
    return false;
  }

  const expectedSig = signValue(email);
  const provided = Buffer.from(signature);
  const expected = Buffer.from(expectedSig);

  if (provided.length !== expected.length) {
    return false;
  }

  return timingSafeEqual(provided, expected);
}

export function requireAuth() {
  if (!isAuthenticated()) {
    redirect("/login");
  }
}
