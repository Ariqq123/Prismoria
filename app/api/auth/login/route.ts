import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { createSessionCookie, getAdminEmail, verifyAdminCredentials } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  const contentType = request.headers.get("content-type") ?? "";

  let email = "";
  let password = "";

  if (contentType.includes("application/json")) {
    const body = (await request.json()) as { email?: string; password?: string };
    email = body.email?.trim().toLowerCase() ?? "";
    password = body.password ?? "";
  } else {
    const formData = await request.formData();
    email = String(formData.get("email") ?? "").trim().toLowerCase();
    password = String(formData.get("password") ?? "");
  }

  const isValid = await verifyAdminCredentials(email, password);
  if (!isValid) {
    if (!contentType.includes("application/json")) {
      return NextResponse.redirect(new URL("/login?error=invalid_credentials", request.url));
    }

    return NextResponse.json({ error: "Invalid credentials." }, { status: 401 });
  }

  const hash = await bcrypt.hash(password, 10);
  let storageSynced = true;

  try {
    await prisma.user.upsert({
      where: { email: getAdminEmail() },
      update: { passwordHash: hash },
      create: { email: getAdminEmail(), passwordHash: hash }
    });
  } catch (error) {
    storageSynced = false;
    console.error("Failed to sync admin user in database during login; continuing with session-only auth.", error);
  }

  createSessionCookie(email);

  if (contentType.includes("application/json")) {
    return NextResponse.json({ success: true, storageSynced });
  }

  return NextResponse.redirect(new URL("/dashboard", request.url));
}
