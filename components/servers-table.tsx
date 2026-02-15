"use client";

type ServerRow = {
  id: string;
  name: string;
  status: string;
  panelSlug: string;
  panelName: string;
};

const signals = ["start", "stop", "restart", "kill"] as const;

type Props = {
  servers: ServerRow[];
  onRefetch: () => Promise<void>;
};

export function ServersTable({ servers, onRefetch }: Props) {
  async function power(server: ServerRow, signal: (typeof signals)[number]) {
    const response = await fetch("/api/servers/power", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ panelSlug: server.panelSlug, serverId: server.id, signal })
    });

    if (!response.ok) {
      const payload = await response.json().catch(() => ({ error: "Action failed" }));
      alert(payload.error ?? "Action failed");
      return;
    }

    await onRefetch();
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-slate-800">
      <table className="min-w-full divide-y divide-slate-800 text-sm">
        <thead className="bg-slate-900">
          <tr>
            <th className="px-3 py-2 text-left">Server</th>
            <th className="px-3 py-2 text-left">Panel</th>
            <th className="px-3 py-2 text-left">Status</th>
            <th className="px-3 py-2 text-left">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-800">
          {servers.map((server) => (
            <tr key={`${server.panelSlug}-${server.id}`}>
              <td className="px-3 py-2">{server.name}</td>
              <td className="px-3 py-2">{server.panelName}</td>
              <td className="px-3 py-2">{server.status}</td>
              <td className="px-3 py-2">
                <div className="flex flex-wrap gap-2">
                  {signals.map((signal) => (
                    <button
                      key={signal}
                      onClick={() => power(server, signal)}
                      className="rounded border border-slate-700 px-2 py-1 hover:bg-slate-800"
                    >
                      {signal}
                    </button>
                  ))}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
