import { PanelSlug, PANEL_MAP } from "@/lib/constants";

export type PteroServer = {
  id: string;
  name: string;
  status: string;
  panelSlug: PanelSlug;
  panelName: string;
};

type ClientServerResponse = {
  attributes: {
    identifier: string;
    name: string;
    status?: string | null;
  };
};

export async function fetchPanelServers(
  panelSlug: PanelSlug,
  apiKey: string
): Promise<PteroServer[]> {
  const panelUrl = PANEL_MAP[panelSlug];

  const response = await fetch(`${panelUrl}/api/client`, {
    headers: {
      Authorization: `Bearer ${apiKey}`,
      Accept: "Application/json",
      "Content-Type": "Application/json"
    },
    cache: "no-store"
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch servers from ${panelSlug}: ${response.status}`);
  }

  const data = (await response.json()) as { data?: ClientServerResponse[] };

  return (data.data ?? []).map((item) => ({
    id: item.attributes.identifier,
    name: item.attributes.name,
    status: item.attributes.status ?? "unknown",
    panelSlug,
    panelName: panelUrl
  }));
}

export async function sendPowerSignal(
  panelSlug: PanelSlug,
  apiKey: string,
  serverId: string,
  signal: "start" | "stop" | "restart" | "kill"
) {
  const panelUrl = PANEL_MAP[panelSlug];

  const response = await fetch(`${panelUrl}/api/client/servers/${serverId}/power`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      Accept: "Application/json",
      "Content-Type": "Application/json"
    },
    body: JSON.stringify({ signal }),
    cache: "no-store"
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Power action failed for ${panelSlug}/${serverId}: ${response.status} ${errorText}`
    );
  }
}
