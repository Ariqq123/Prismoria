"use client";

import { FormEvent, useState } from "react";

type Props = {
  panelOptions: Array<{ slug: string; url: string }>;
  onConnected: () => Promise<void>;
};

export function ConnectPanelForm({ panelOptions, onConnected }: Props) {
  const [panelSlug, setPanelSlug] = useState(panelOptions[0]?.slug ?? "");
  const [apiKey, setApiKey] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setMessage(null);

    const response = await fetch("/api/panels/connect", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ panelSlug, apiKey })
    });

    if (!response.ok) {
      const payload = await response.json().catch(() => ({ error: "Failed to connect panel" }));
      setMessage(payload.error ?? "Failed to connect panel");
      setLoading(false);
      return;
    }

    setApiKey("");
    setMessage("Panel connected successfully.");
    await onConnected();
    setLoading(false);
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3 rounded-lg border border-slate-800 p-4">
      <h2 className="text-lg font-medium">Connect Panel</h2>
      <select
        value={panelSlug}
        onChange={(event) => setPanelSlug(event.target.value)}
        className="w-full rounded border border-slate-700 bg-slate-950 px-3 py-2"
      >
        {panelOptions.map((panel) => (
          <option key={panel.slug} value={panel.slug}>
            {panel.slug} ({panel.url})
          </option>
        ))}
      </select>

      <input
        type="password"
        value={apiKey}
        onChange={(event) => setApiKey(event.target.value)}
        placeholder="Pterodactyl Client API Key"
        required
        className="w-full rounded border border-slate-700 bg-slate-950 px-3 py-2"
      />

      <button
        type="submit"
        disabled={loading}
        className="rounded bg-indigo-600 px-4 py-2 font-medium hover:bg-indigo-500 disabled:opacity-60"
      >
        {loading ? "Connecting..." : "Save Connection"}
      </button>

      {message ? <p className="text-sm text-slate-300">{message}</p> : null}
    </form>
  );
}
