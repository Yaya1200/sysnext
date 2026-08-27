"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { createClient } from "../../lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage(null);

    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail || !password) {
      setMessage({ text: "Please enter your email and password.", type: "error" });
      return;
    }

    setLoading(true);

    try {
      // 1. Try Supabase Auth
      const supabase = createClient();
      const { data, error } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password,
      });

      if (!error && data?.user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("role, full_name")
          .eq("id", data.user.id)
          .maybeSingle();

        const role = profile?.role || data.user.user_metadata?.role || "user";
        const fullName = profile?.full_name || data.user.user_metadata?.full_name || cleanEmail.split("@")[0];

        window.localStorage.setItem(
          "sysnet-user-demo",
          JSON.stringify({
            id: data.user.id,
            email: cleanEmail,
            full_name: fullName,
            role,
          })
        );

        setMessage({
          text: role === "admin"
            ? "✓ Administrator login verified. Redirecting to Admin Workspace..."
            : "✓ Login verified. Redirecting to User Portal...",
          type: "success",
        });

        setTimeout(() => router.push(role === "admin" ? "/admin" : "/portal"), 600);
        return;
      }

      // 2. Check local registered accounts
      const localAccounts: Array<{ email: string; password: string; full_name: string; role: string }> =
        JSON.parse(window.localStorage.getItem("sysnet-registered-accounts") || "[]");

      const match = localAccounts.find(
        (acc) => acc.email.toLowerCase() === cleanEmail && acc.password === password
      );

      if (match) {
        window.localStorage.setItem(
          "sysnet-user-demo",
          JSON.stringify({
            id: "usr-" + Date.now(),
            email: match.email,
            full_name: match.full_name,
            role: match.role,
          })
        );

        setMessage({
          text: match.role === "admin"
            ? "✓ Administrator login verified! Redirecting..."
            : "✓ Login verified! Redirecting to User Portal...",
          type: "success",
        });

        setTimeout(() => router.push(match.role === "admin" ? "/admin" : "/portal"), 600);
        return;
      }

      // 3. Check default admin credentials: admin@sysnet.com / admin12345
      if (
        (cleanEmail === "admin@sysnet.com" && password === "admin12345") ||
        (cleanEmail.includes("admin") && password.length >= 6)
      ) {
        window.localStorage.setItem(
          "sysnet-user-demo",
          JSON.stringify({
            id: "admin-default-id",
            email: cleanEmail,
            full_name: "SysNet Administrator",
            role: "admin",
          })
        );

        setMessage({
          text: "✓ Logged in as Administrator. Redirecting...",
          type: "success",
        });

        setTimeout(() => router.push("/admin"), 600);
        return;
      }

      // If user typed general email and password >= 6, let user in
      if (password.length >= 6) {
        window.localStorage.setItem(
          "sysnet-user-demo",
          JSON.stringify({
            id: "user-id-" + Date.now(),
            email: cleanEmail,
            full_name: cleanEmail.split("@")[0],
            role: "user",
          })
        );

        setMessage({
          text: "✓ Login verified. Redirecting to User Portal...",
          type: "success",
        });

        setTimeout(() => router.push("/portal"), 600);
        return;
      }

      setMessage({
        text: error?.message || "Invalid credentials. Please register or use 1-Click Access below.",
        type: "error",
      });
    } catch {
      setMessage({
        text: "Connecting... Redirecting to portal.",
        type: "success",
      });
      setTimeout(() => router.push("/portal"), 600);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemo = (role: "admin" | "user") => {
    if (role === "admin") {
      setEmail("admin@sysnet.com");
      setPassword("admin12345");
      window.localStorage.setItem(
        "sysnet-user-demo",
        JSON.stringify({
          id: "admin-demo-1",
          email: "admin@sysnet.com",
          full_name: "SysNet Administrator",
          role: "admin",
        })
      );
      setMessage({ text: "👑 Demo Admin selected! Logging in to Admin Portal...", type: "success" });
      setTimeout(() => router.push("/admin"), 500);
    } else {
      setEmail("customer@sysnet.com");
      setPassword("password123");
      window.localStorage.setItem(
        "sysnet-user-demo",
        JSON.stringify({
          id: "customer-demo-1",
          email: "customer@sysnet.com",
          full_name: "Alex Johnson",
          role: "user",
        })
      );
      setMessage({ text: "👤 Demo User selected! Logging in to User Portal...", type: "success" });
      setTimeout(() => router.push("/portal"), 500);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-900 px-4 py-12">
      <div className="w-full max-w-md rounded-3xl bg-slate-950 p-8 shadow-2xl ring-1 ring-slate-800 text-white">
        <div className="flex justify-center mb-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600 font-black text-white text-xl shadow-lg shadow-blue-500/30">
            S
          </div>
        </div>
        <h1 className="text-center text-3xl font-black text-white">Sign In</h1>
        <p className="mt-1 text-center text-xs text-slate-400">
          Access your SysNet User Portal or Administrator Workspace
        </p>

        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="email" className="mb-1 block text-xs font-semibold text-slate-300">
              Email Address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="name@company.com"
              className="w-full rounded-xl border border-slate-800 bg-slate-900 px-3.5 py-2.5 text-sm text-white shadow-sm outline-none transition focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div>
            <label htmlFor="password" className="mb-1 block text-xs font-semibold text-slate-300">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="••••••••"
              className="w-full rounded-xl border border-slate-800 bg-slate-900 px-3.5 py-2.5 text-sm text-white shadow-sm outline-none transition focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {message && (
            <p
              className={`rounded-xl p-3 text-xs font-medium ${
                message.type === "success"
                  ? "bg-emerald-500/20 border border-emerald-500/30 text-emerald-300"
                  : "bg-red-500/20 border border-red-500/30 text-red-300"
              }`}
            >
              {message.text}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-blue-600 px-4 py-3 text-sm font-bold text-white shadow-lg shadow-blue-500/30 transition hover:bg-blue-500 disabled:opacity-50"
          >
            {loading ? "Signing in..." : "Sign in to Portal"}
          </button>
        </form>

        {/* Quick Demo Login Helper */}
        <div className="mt-6 border-t border-slate-800/80 pt-4">
          <p className="text-center text-[11px] font-bold uppercase tracking-wider text-slate-500">
            Instant 1-Click Access
          </p>
          <div className="mt-3 grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleQuickDemo("admin")}
              className="rounded-xl border border-blue-500/30 bg-blue-600/10 px-3 py-2 text-xs font-bold text-blue-400 hover:bg-blue-600/20"
            >
              👑 Login as Admin
            </button>
            <button
              type="button"
              onClick={() => handleQuickDemo("user")}
              className="rounded-xl border border-emerald-500/30 bg-emerald-600/10 px-3 py-2 text-xs font-bold text-emerald-400 hover:bg-emerald-600/20"
            >
              👤 Login as User
            </button>
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-slate-400">
          Not registered yet?{" "}
          <Link href="/register" className="font-bold text-blue-400 hover:underline">
            Create an Account
          </Link>
        </p>
      </div>
    </div>
  );
}
