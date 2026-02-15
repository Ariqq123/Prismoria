"use client";

import { useCallback, useEffect, useState } from "react";
import { ConnectPanelForm } from "@/components/connect-panel-form";
import { ServersTable } from "@/components/servers-table";

type ServerRow = {
  id: string;
  name: string;
  status: string;
  panelSlug: string;
  panelName: string;
};

type Props = {
  panelOptions: Array<{ slug: string; url: string }>;
};

export function DashboardClient({ panelOptions }: Props) {
  const [servers, setServers] = useState<ServerRow[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchServers = useCallback(async () => {
    setLoading(true);
    const response = await fetch("/api/servers", { cache: "no-store" });
    const payload = await response.json();
    setServers(payload.servers ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    void fetchServers();
  }, [fetchServers]);

  return (
    <div className="space-y-6">
      <ConnectPanelForm panelOptions={panelOptions} onConnected={fetchServers} />

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-medium">Combined Servers</h2>
          <button
            onClick={() => fetchServers()}
            className="rounded border border-slate-700 px-3 py-1 text-sm hover:bg-slate-900"
          >
            Refresh
          </button>
        </div>

        {loading ? <p className="text-slate-400">Loading servers...</p> : null}
        {!loading ? <ServersTable servers={servers} onRefetch={fetchServers} /> : null}
      </section>
    </div>
  );
}
