"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { createClient } from "../../lib/supabase/client";

export default function RegisterPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState<"user" | "admin">("user");
  const [adminCode, setAdminCode] = useState("");
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage(null);

    if (!fullName || !email || !password || !confirmPassword) {
      setMessage({ text: "Please fill in all required fields.", type: "error" });
      return;
    }

    if (password.length < 6) {
      setMessage({ text: "Password must be at least 6 characters long.", type: "error" });
      return;
    }

    if (password !== confirmPassword) {
      setMessage({ text: "Passwords do not match.", type: "error" });
      return;
    }

    if (role === "admin" && !adminCode) {
      setMessage({ text: "Administrator registration code is required. (Default: admin12345)", type: "error" });
      return;
    }

    setIsSubmitting(true);

    try {
      // 1. Call API registration
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fullName, email, password, role, adminCode }),
      });

      const result = await response.json();

      if (!response.ok) {
        setMessage({ text: result.error || "Registration failed.", type: "error" });
        setIsSubmitting(false);
        return;
      }

      // Also attempt Supabase client sign up
      try {
        await createClient().auth.signUp({
          email,
          password,
          options: { data: { full_name: fullName, role } },
        });
      } catch {
        // ignore
      }

      // Save to registered accounts in localStorage for instant offline/mock login support
      const existingAccounts = JSON.parse(window.localStorage.getItem("sysnet-registered-accounts") || "[]");
      existingAccounts.push({
        id: result.user?.id || "usr-" + Date.now(),
        email: email.toLowerCase(),
        password,
        full_name: fullName,
        role,
      });
      window.localStorage.setItem("sysnet-registered-accounts", JSON.stringify(existingAccounts));

      // Auto login
      window.localStorage.setItem(
        "sysnet-user-demo",
        JSON.stringify({
          id: result.user?.id || "usr-" + Date.now(),
          email: email.toLowerCase(),
          full_name: fullName,
          role,
        })
      );

      setMessage({
        text: role === "admin"
          ? "✓ Administrator account created! Logging in to Admin Portal..."
          : "✓ Account created successfully! Logging in to User Portal...",
        type: "success",
      });

      setTimeout(() => {
        router.push(role === "admin" ? "/admin" : "/portal");
      }, 1000);
    } catch {
      setMessage({
        text: "Could not reach server. Please check your connection and try again.",
        type: "error",
      });
    } finally {
      setIsSubmitting(false);
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
        <h1 className="text-center text-3xl font-black text-white">Create Account</h1>
        <p className="mt-1 text-center text-xs text-slate-400">
          Register for SysNet User Portal or Administrator Workspace
        </p>

        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="fullname" className="mb-1 block text-xs font-semibold text-slate-300">
              Full Name *
            </label>
            <input
              id="fullname"
              name="fullname"
              type="text"
              autoComplete="name"
              required
              placeholder="e.g. Abel Samuel"
              value={fullName}
              onChange={(event) => setFullName(event.target.value)}
              className="w-full rounded-xl border border-slate-800 bg-slate-900 px-3.5 py-2.5 text-sm text-white shadow-sm outline-none transition focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div>
            <label htmlFor="role" className="mb-1 block text-xs font-semibold text-slate-300">
              Account Type *
            </label>
            <select
              id="role"
              value={role}
              onChange={(event) => setRole(event.target.value as "user" | "admin")}
              className="w-full rounded-xl border border-slate-800 bg-slate-900 px-3.5 py-2.5 text-sm text-white shadow-sm outline-none transition focus:border-blue-500 focus:ring-1 focus:ring-blue-500 font-medium"
            >
              <option value="user">User / Client Member</option>
              <option value="admin">Administrator</option>
            </select>
          </div>

          {role === "admin" && (
            <div className="rounded-xl border border-blue-500/30 bg-blue-600/10 p-3.5 space-y-2">
              <label htmlFor="admin-code" className="block text-xs font-bold text-blue-300">
                Administrator Registration Code *
              </label>
              <input
                id="admin-code"
                type="password"
                required
                placeholder="Enter admin code (Default: admin12345)"
                value={adminCode}
                onChange={(event) => setAdminCode(event.target.value)}
                className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-white outline-none focus:border-blue-500"
              />
              <p className="text-[11px] text-slate-400">
                Default system admin passcode is: <strong className="text-white">admin12345</strong>
              </p>
            </div>
          )}

          <div>
            <label htmlFor="email" className="mb-1 block text-xs font-semibold text-slate-300">
              Email Address *
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              placeholder="name@company.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="w-full rounded-xl border border-slate-800 bg-slate-900 px-3.5 py-2.5 text-sm text-white shadow-sm outline-none transition focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="password" className="mb-1 block text-xs font-semibold text-slate-300">
                Password *
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                placeholder="Min. 6 chars"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="w-full rounded-xl border border-slate-800 bg-slate-900 px-3.5 py-2.5 text-sm text-white shadow-sm outline-none transition focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div>
              <label htmlFor="confirm-password" className="mb-1 block text-xs font-semibold text-slate-300">
                Confirm Password *
              </label>
              <input
                id="confirm-password"
                name="confirm-password"
                type="password"
                autoComplete="new-password"
                required
                placeholder="Repeat password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                className="w-full rounded-xl border border-slate-800 bg-slate-900 px-3.5 py-2.5 text-sm text-white shadow-sm outline-none transition focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>
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
            disabled={isSubmitting}
            className="w-full rounded-xl bg-blue-600 px-4 py-3 text-sm font-bold text-white shadow-lg shadow-blue-500/30 transition hover:bg-blue-500 disabled:opacity-50"
          >
            {isSubmitting
              ? "Creating Account..."
              : role === "admin"
              ? "Create Administrator Account"
              : "Create Member Account"}
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-slate-400">
          Already registered?{" "}
          <Link href="/login" className="font-bold text-blue-400 hover:underline">
            Sign in here
          </Link>
        </p>
      </div>
    </div>
  );
}
