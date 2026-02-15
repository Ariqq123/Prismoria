import { NextResponse } from "next/server";
import { getAdminEmail, isAuthenticated } from "@/lib/auth";
import { PanelSlug } from "@/lib/constants";
import { decryptApiKey } from "@/lib/crypto";
import { prisma } from "@/lib/prisma";
import { sendPowerSignal } from "@/lib/pterodactyl";

const VALID_SIGNALS = new Set(["start", "stop", "restart", "kill"]);

export async function POST(request: Request) {
  if (!isAuthenticated()) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as {
    panelSlug?: PanelSlug;
    serverId?: string;
    signal?: "start" | "stop" | "restart" | "kill";
  };

  if (!body.panelSlug || !body.serverId || !body.signal || !VALID_SIGNALS.has(body.signal)) {
    return NextResponse.json({ error: "Invalid request payload." }, { status: 400 });
  }

  const user = await prisma.user.findUnique({
    where: { email: getAdminEmail() },
    include: { panelConnections: true }
  });

  const connection = user?.panelConnections.find((item) => item.panelSlug === body.panelSlug);
  if (!connection) {
    return NextResponse.json({ error: "Panel is not connected." }, { status: 404 });
  }

  await sendPowerSignal(
    body.panelSlug,
    decryptApiKey(connection.apiKeyEnc),
    body.serverId,
    body.signal
  );

  return NextResponse.json({ success: true });
}
