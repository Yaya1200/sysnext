"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { createClient } from "../../lib/supabase/client";

export default function RegisterPage() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState<"user" | "admin">("user");
  const [adminCode, setAdminCode] = useState("");

  const [message, setMessage] = useState<{
    text: string;
    type: "success" | "error";
  } | null>(null);

  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage(null);

    const cleanName = fullName.trim();
    const cleanEmail = email.trim().toLowerCase();

    if (!cleanName || !cleanEmail || !password || !confirmPassword) {
      setMessage({
        text: "Please fill all fields.",
        type: "error",
      });
      return;
    }

    if (password.length < 6) {
      setMessage({
        text: "Password must be at least 6 characters.",
        type: "error",
      });
      return;
    }

    if (password !== confirmPassword) {
      setMessage({
        text: "Passwords do not match.",
        type: "error",
      });
      return;
    }

    if (role === "admin" && !adminCode.trim()) {
      setMessage({
        text: "Admin registration code required.",
        type: "error",
      });
      return;
    }

    setLoading(true);

    try {
      const supabase = createClient();

      const { error } = await supabase.auth.signUp({
        email: cleanEmail,
        password,
        options: {
          data: {
            full_name: cleanName,
            role,
          },

          // After the user clicks the confirmation email,
          // Supabase sends them to our callback route.
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) {
        setMessage({
          text: error.message,
          type: "error",
        });
        return;
      }

      setMessage({
        text: "✅ Account created! Check your email and click the confirmation link. You will then be taken to the login page.",
        type: "success",
      });
    } catch (error: unknown) {
      setMessage({
        text:
          error instanceof Error
            ? error.message
            : "Unexpected error occurred.",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-900 px-4 py-12">
      <div className="w-full max-w-md rounded-3xl bg-slate-950 p-8 text-white shadow-2xl ring-1 ring-slate-800">
        <div className="mb-4 flex justify-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600 text-xl font-black text-white shadow-lg shadow-blue-500/30">
            S
          </div>
        </div>

        <h1 className="text-center text-3xl font-black text-white">
          Create Account
        </h1>

        <p className="mt-1 text-center text-xs text-slate-400">
          Register for SysNet User Portal or Administrator Workspace
        </p>

        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          {/* Full Name */}
          <div>
            <label
              htmlFor="fullname"
              className="mb-1 block text-xs font-semibold text-slate-300"
            >
              Full Name *
            </label>

            <input
              id="fullname"
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="e.g. Abel Samuel"
              className="w-full rounded-xl border border-slate-800 bg-slate-900 px-3.5 py-2.5 text-sm text-white shadow-sm outline-none transition focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {/* Account Type */}
          <div>
            <label
              htmlFor="role"
              className="mb-1 block text-xs font-semibold text-slate-300"
            >
              Account Type *
            </label>

            <select
              id="role"
              value={role}
              onChange={(e) =>
                setRole(e.target.value as "user" | "admin")
              }
              className="w-full rounded-xl border border-slate-800 bg-slate-900 px-3.5 py-2.5 text-sm font-medium text-white outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            >
              <option value="user">User / Client Member</option>
              <option value="admin">Administrator</option>
            </select>
          </div>

          {/* Admin Code */}
          {role === "admin" && (
            <div className="space-y-2 rounded-xl border border-blue-500/30 bg-blue-600/10 p-3.5">
              <label
                htmlFor="admin-code"
                className="block text-xs font-bold text-blue-300"
              >
                Administrator Registration Code *
              </label>

              <input
                id="admin-code"
                type="password"
                required
                value={adminCode}
                onChange={(e) => setAdminCode(e.target.value)}
                placeholder="Enter administrator code"
                className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-white outline-none focus:border-blue-500"
              />
            </div>
          )}

          {/* Email */}
          <div>
            <label
              htmlFor="email"
              className="mb-1 block text-xs font-semibold text-slate-300"
            >
              Email Address *
            </label>

            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@company.com"
              className="w-full rounded-xl border border-slate-800 bg-slate-900 px-3.5 py-2.5 text-sm text-white shadow-sm outline-none transition focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {/* Password */}
          <div>
            <label
              htmlFor="password"
              className="mb-1 block text-xs font-semibold text-slate-300"
            >
              Password *
            </label>

            <input
              id="password"
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Min. 6 characters"
              className="w-full rounded-xl border border-slate-800 bg-slate-900 px-3.5 py-2.5 text-sm text-white shadow-sm outline-none transition focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {/* Confirm Password */}
          <div>
            <label
              htmlFor="confirm-password"
              className="mb-1 block text-xs font-semibold text-slate-300"
            >
              Confirm Password *
            </label>

            <input
              id="confirm-password"
              type="password"
              required
              minLength={6}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Repeat password"
              className="w-full rounded-xl border border-slate-800 bg-slate-900 px-3.5 py-2.5 text-sm text-white shadow-sm outline-none transition focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {/* Message */}
          {message && (
            <p
              role="alert"
              className={`rounded-xl border p-3 text-xs font-medium ${
                message.type === "success"
                  ? "border-emerald-500/30 bg-emerald-500/20 text-emerald-300"
                  : "border-red-500/30 bg-red-500/20 text-red-300"
              }`}
            >
              {message.text}
            </p>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-blue-600 px-4 py-3 text-sm font-bold text-white shadow-lg shadow-blue-500/30 transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Creating account..." : "Create Account"}
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-slate-400">
          Already registered?{" "}
          <Link
            href="/login"
            className="font-bold text-blue-400 hover:underline"
          >
            Sign in here
          </Link>
        </p>
      </div>
    </div>
  );
}

