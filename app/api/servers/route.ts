import { NextResponse } from "next/server";
import { getAdminEmail, isAuthenticated } from "@/lib/auth";
import { PanelSlug } from "@/lib/constants";
import { decryptApiKey } from "@/lib/crypto";
import { prisma } from "@/lib/prisma";
import { fetchPanelServers } from "@/lib/pterodactyl";

export async function GET() {
  if (!isAuthenticated()) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { email: getAdminEmail() },
    include: { panelConnections: true }
  });

  if (!user) {
    return NextResponse.json({ servers: [] });
  }

  const responses = await Promise.allSettled(
    user.panelConnections.map((connection: { panelSlug: string; apiKeyEnc: string }) =>
      fetchPanelServers(connection.panelSlug as PanelSlug, decryptApiKey(connection.apiKeyEnc))
    )
  );

  const servers = responses.flatMap(
    (result: PromiseSettledResult<Awaited<ReturnType<typeof fetchPanelServers>>>) =>
      result.status === "fulfilled" ? result.value : []
  );

  return NextResponse.json({ servers, total: servers.length });
}
