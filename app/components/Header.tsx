"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { createClient } from "../../lib/supabase/client";
import { useCart } from "./CartProvider";

const navItems = [
  { name: "Home", href: "/" },
  { name: "About", href: "/about" },
  { name: "Services", href: "/services" },
  { name: "Blog", href: "/blog" },
  { name: "Shop", href: "/shop" },
  { name: "Contact", href: "/contact" },
];

export default function Header() {
  const { itemCount } = useCart();
  const [user, setUser] = useState<{ name: string; role: string } | null>(null);

  useEffect(() => {
    async function checkAuth() {
      try {
        const supabase = createClient();
        const { data: { session } } = await supabase.auth.getSession();

        if (session?.user) {
          const { data: profile } = await supabase
            .from("profiles")
            .select("role, full_name")
            .eq("id", session.user.id)
            .maybeSingle();

          setUser({
            name: profile?.full_name || session.user.email?.split("@")[0] || "User",
            role: profile?.role || "user",
          });
          return;
        }

        // Check local demo user
        const local = window.localStorage.getItem("sysnet-user-demo");
        if (local) {
          const parsed = JSON.parse(local);
          setUser({ name: parsed.full_name || "User", role: parsed.role || "user" });
        }
      } catch {
        // ignore
      }
    }

    checkAuth();
  }, []);

  const handleSignOut = async () => {
    window.localStorage.removeItem("sysnet-user-demo");
    await createClient().auth.signOut();
    setUser(null);
    window.location.href = "/";
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/95 backdrop-blur-sm">
      {/* Top Banner */}
      <div className="bg-slate-950 py-2 text-xs text-white">
        <div className="container mx-auto flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between px-4">
          <div className="flex flex-wrap items-center gap-3 text-slate-300">
            <span>🕒 8:30 AM - 5:30 PM</span>
            <span className="hidden sm:inline text-slate-600">|</span>
            <span>📞 +251 (0) 911 04 67 05</span>
          </div>

          <div className="flex items-center gap-4">
            {user ? (
              <div className="flex items-center gap-3">
                <span className="text-slate-400">
                  Welcome, <strong className="text-white">{user.name}</strong>
                </span>
                {user.role === "admin" ? (
                  <Link
                    href="/admin"
                    className="rounded bg-blue-600 px-2 py-0.5 font-bold text-white hover:bg-blue-500"
                  >
                    Admin Portal ⚙️
                  </Link>
                ) : (
                  <Link
                    href="/portal"
                    className="rounded bg-emerald-600 px-2 py-0.5 font-bold text-white hover:bg-emerald-500"
                  >
                    User Portal 👤
                  </Link>
                )}
                <button
                  type="button"
                  onClick={handleSignOut}
                  className="text-red-400 hover:text-red-300 font-semibold"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3 text-slate-300">
                <Link href="/login" className="font-semibold transition hover:text-blue-400">
                  Login
                </Link>
                <span className="text-slate-600">/</span>
                <Link href="/register" className="font-semibold transition hover:text-blue-400">
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="container mx-auto flex h-20 max-w-screen-2xl items-center justify-between gap-6 px-4">
        <Link href="/" className="flex items-center gap-3" aria-label="SysNet home page">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600 text-lg font-black text-white shadow-lg shadow-blue-500/30">
            S
          </div>
          <div>
            <div className="text-lg font-black tracking-wider text-slate-900">SYSNET</div>
            <div className="text-[10px] font-semibold uppercase tracking-[0.26em] text-slate-500">
              Technologies
            </div>
          </div>
        </Link>

        <nav className="hidden items-center gap-7 text-sm font-bold text-slate-700 md:flex">
          {navItems.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className="transition-colors hover:text-blue-600"
            >
              {item.name}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <Link
            href="/shop/cart"
            className="flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-xs font-bold text-slate-800 transition hover:bg-slate-100"
          >
            <span>🛒</span>
            <span>Cart</span>
            {itemCount > 0 && (
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-[11px] font-bold text-white">
                {itemCount}
              </span>
            )}
          </Link>

          {user ? (
            <Link
              href={user.role === "admin" ? "/admin" : "/portal"}
              className="hidden rounded-full bg-blue-600 px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-blue-500/20 transition hover:bg-blue-700 md:inline-flex"
            >
              {user.role === "admin" ? "Admin Workspace" : "My Portal"}
            </Link>
          ) : (
            <Link
              href="/contact"
              className="hidden rounded-full bg-blue-600 px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-blue-500/20 transition hover:bg-blue-700 md:inline-flex"
            >
              Contact Us
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}