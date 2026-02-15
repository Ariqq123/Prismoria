import { DashboardClient } from "@/components/dashboard-client";
import { clearSessionCookie, requireAuth } from "@/lib/auth";
import { PANEL_MAP } from "@/lib/constants";

export default function DashboardPage() {
  requireAuth();

  const panelOptions = Object.entries(PANEL_MAP).map(([slug, url]) => ({ slug, url }));

  async function logout() {
    "use server";
    clearSessionCookie();
  }

  return (
    <main className="mx-auto min-h-screen w-full max-w-6xl space-y-6 px-4 py-8">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Multi-Panel Pterodactyl Dashboard</h1>
        <form action={logout}>
          <button className="rounded border border-slate-700 px-3 py-1 hover:bg-slate-900">Logout</button>
        </form>
      </header>

      <DashboardClient panelOptions={panelOptions} />
    </main>
  );
}
