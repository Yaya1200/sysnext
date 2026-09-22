// Login page with password authentication for existing users and magic‑link fallback for first‑time registration
"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import { createClient } from "../../lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);
  const [loading, setLoading] = useState(false);

  // Redirect if a valid session already exists
  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", session.user.id)
          .single();
        const role = profile?.role || "user";
        router.replace(role === "admin" ? "/admin" : "/portal");
      }
    });
  }, []);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage(null);
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail) {
      setMessage({ text: "Please enter your email.", type: "error" });
      return;
    }
    setLoading(true);
    try {
      const supabase = createClient();
      // Try password sign‑in first
      const { error: pwdError, data } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password,
      });
      if (!pwdError && data?.user) {
        // Successful password login – redirect based on role
        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", data.user.id)
          .single();
        const role = profile?.role || "user";
        router.replace(role === "admin" ? "/admin" : "/portal");
        setMessage({ text: "✅ Login successful.", type: "success" });
      } else {
        // If password login fails (e.g., user not found or wrong password), fall back to magic‑link
        const { error: otpError } = await supabase.auth.signInWithOtp({ email: cleanEmail });
        if (otpError) {
          setMessage({ text: otpError.message, type: "error" });
        } else {
          setMessage({ text: "✅ Check your email for a login link.", type: "success" });
        }
      }
    } catch (e: any) {
      setMessage({ text: e?.message || "Unexpected error.", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-900 px-4 py-12">
      <div className="w-full max-w-md rounded-3xl bg-slate-950 p-8 shadow-2xl ring-1 ring-slate-800 text-white">
        <div className="flex justify-center mb-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600 font-black text-white text-xl shadow-lg shadow-blue-500/30">S</div>
        </div>
        <h1 className="text-center text-3xl font-black text-white">Sign In</h1>
        <p className="mt-1 text-center text-xs text-slate-400">
          Access your SysNet User Portal or Administrator Workspace
        </p>
        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="email" className="mb-1 block text-xs font-semibold text-slate-300">Email Address</label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@company.com"
              className="w-full rounded-xl border border-slate-800 bg-slate-900 px-3.5 py-2.5 text-sm text-white shadow-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <div>
            <label htmlFor="password" className="mb-1 block text-xs font-semibold text-slate-300">Password (optional)</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Leave empty for magic link"
              className="w-full rounded-xl border border-slate-800 bg-slate-900 px-3.5 py-2.5 text-sm text-white shadow-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </div>
          {message && (
            <p className={`rounded-xl p-3 text-xs font-medium ${message.type === "success" ? "bg-emerald-500/20 border border-emerald-500/30 text-emerald-300" : "bg-red-500/20 border border-red-500/30 text-red-300"}`}>
              {message.text}
            </p>
          )}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-blue-600 px-4 py-3 text-sm font-bold text-white shadow-lg hover:bg-blue-500 disabled:opacity-50"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>
        <p className="mt-6 text-center text-xs text-slate-400">
          Not registered yet?{' '}
          <Link href="/register" className="font-bold text-blue-400 hover:underline">Create an Account</Link>
        </p>
      </div>
    </div>
  );
}
