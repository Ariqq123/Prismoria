import { getAdminEmail } from "@/lib/auth";

type LoginPageProps = {
  searchParams?: {
    error?: string;
  };
};

export default function LoginPage({ searchParams }: LoginPageProps) {
  const hasError = searchParams?.error === "invalid_credentials";

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md items-center justify-center px-4">
      <form
        action="/api/auth/login"
        method="post"
        className="w-full space-y-4 rounded-lg border border-slate-800 bg-slate-900 p-6 shadow"
      >
        <h1 className="text-xl font-semibold">Admin Login</h1>
        <p className="text-sm text-slate-400">Only {getAdminEmail()} can access this dashboard.</p>
        {hasError ? (
          <p className="rounded border border-red-900 bg-red-950/50 px-3 py-2 text-sm text-red-300">
            Invalid credentials. Please try again.
          </p>
        ) : null}

        <div>
          <label htmlFor="email" className="mb-1 block text-sm text-slate-300">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            defaultValue={getAdminEmail()}
            className="w-full rounded border border-slate-700 bg-slate-950 px-3 py-2 outline-none ring-indigo-500 focus:ring"
          />
        </div>

        <div>
          <label htmlFor="password" className="mb-1 block text-sm text-slate-300">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            className="w-full rounded border border-slate-700 bg-slate-950 px-3 py-2 outline-none ring-indigo-500 focus:ring"
          />
        </div>

        <button
          type="submit"
          className="w-full rounded bg-indigo-600 px-4 py-2 font-medium hover:bg-indigo-500"
        >
          Sign In
        </button>
      </form>
    </main>
  );
}
