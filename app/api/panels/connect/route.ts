import { NextResponse } from "next/server";
import { decryptApiKey, encryptApiKey } from "@/lib/crypto";
import { getAdminEmail, isAuthenticated } from "@/lib/auth";
import { PANEL_MAP, PanelSlug } from "@/lib/constants";
import { prisma } from "@/lib/prisma";
import { fetchPanelServers } from "@/lib/pterodactyl";

export async function POST(request: Request) {
  if (!isAuthenticated()) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as { panelSlug?: PanelSlug; apiKey?: string };
  const panelSlug = body.panelSlug;
  const apiKey = body.apiKey?.trim();

  if (!panelSlug || !(panelSlug in PANEL_MAP)) {
    return NextResponse.json({ error: "Invalid panel slug." }, { status: 400 });
  }

  if (!apiKey) {
    return NextResponse.json({ error: "API key is required." }, { status: 400 });
  }

  try {
    await fetchPanelServers(panelSlug, apiKey);
  } catch {
    return NextResponse.json(
      { error: "Failed to validate API key against panel Client API." },
      { status: 400 }
    );
  }

  const user = await prisma.user.findUnique({ where: { email: getAdminEmail() } });
  if (!user) {
    return NextResponse.json({ error: "Admin user not found. Please login first." }, { status: 400 });
  }

  const encryptedKey = encryptApiKey(apiKey);
  await prisma.panelConnection.upsert({
    where: { userId_panelSlug: { userId: user.id, panelSlug } },
    update: { apiKeyEnc: encryptedKey },
    create: { userId: user.id, panelSlug, apiKeyEnc: encryptedKey }
  });

  // quick sanity check round-trip
  decryptApiKey(encryptedKey);

  return NextResponse.json({ success: true });
}
