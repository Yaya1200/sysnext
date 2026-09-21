"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import Image from "next/image";
import { createClient } from "../../lib/supabase/client";
import { useCart } from "./CartProvider";

const navItems = [
  { name: "Home", href: "/" },
  { name: "About", href: "/about" },
  { name: "Services", href: "/services" },
  { name: "Blog", href: "/blog" },
  { name: "Shop", href: "/shop" },
  { name: "Contact", href: "/contact" },
  { name: "Gallery", href: "/gallery" },
  
];

export default function Header() {
  const { itemCount } = useCart();
  const [user, setUser] = useState<{ name: string; role: string } | null>(
    null
  );

  useEffect(() => {
    async function checkAuth() {
      try {
        const supabase = createClient();

        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (session?.user) {
          const { data: profile } = await supabase
            .from("profiles")
            .select("role, full_name")
            .eq("id", session.user.id)
            .maybeSingle();

          setUser({
            name:
              profile?.full_name ||
              session.user.email?.split("@")[0] ||
              "User",
            role: profile?.role || "user",
          });

          return;
        }

        const local = window.localStorage.getItem("sysnet-user-demo");

        if (local) {
          const parsed = JSON.parse(local);

          setUser({
            name: parsed.full_name || "User",
            role: parsed.role || "user",
          });
        }
      } catch {
        // Ignore authentication errors
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
    <header className="sticky top-0 z-50 w-full bg-white shadow-sm">
      {/* Very Small Top Bar */}
      <div className="hidden bg-slate-950 text-[10px] text-slate-300 sm:block">
        <div className="container mx-auto flex h-6 items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <span>🕒 8:30 AM - 5:30 PM</span>
            <span className="text-slate-600">|</span>
            <span>📞 +251911249171</span>
          </div>

          <div className="flex items-center gap-3">
            {user ? (
              <>
                <span>
                  Welcome,{" "}
                  <strong className="text-white">{user.name}</strong>
                </span>

                <Link
                  href={user.role === "admin" ? "/admin" : "/portal"}
                  className="font-semibold text-blue-400 hover:text-blue-300"
                >
                  {user.role === "admin" ? "Admin Portal" : "My Portal"}
                </Link>

                <button
                  type="button"
                  onClick={handleSignOut}
                  className="font-semibold text-red-400 hover:text-red-300"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="font-semibold hover:text-blue-400"
                >
                  Login
                </Link>

                <span className="text-slate-600">/</span>

                <Link
                  href="/register"
                  className="font-semibold hover:text-blue-400"
                >
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      </div>

     
{/* Main Navbar */}
<div className="container mx-auto flex h-12 max-w-screen-2xl items-center justify-between px-4">
  {/* Logo */}
  <Link
    href="/"
    className="flex shrink-0 items-center"
    aria-label="SysNet home page"
  >
    <Image
      src="/images/logo/sysnet-logo.jpg"
      alt="SysNet Technologies"
      width={160}
      height={72}
      priority
      className="h-8 w-auto object-contain"
    />
  </Link>



        {/* Navigation */}
        <nav className="hidden items-center gap-5 text-xs font-bold text-slate-700 md:flex">
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

        {/* Right Side */}
        <div className="flex items-center gap-2">
          {/* Cart */}
          <Link
            href="/shop/cart"
            aria-label={`Shopping cart${itemCount > 0 ? `, ${itemCount} items` : ""}`}
            className="relative flex h-8 items-center gap-1.5 rounded-full border border-slate-200 px-3 text-[11px] font-bold text-slate-700 transition hover:bg-slate-50"
          >
            <span>🛒</span>
            <span className="hidden sm:inline">Cart</span>

            {itemCount > 0 && (
              <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-blue-600 px-1 text-[9px] font-bold text-white">
                {itemCount}
              </span>
            )}
          </Link>

          {/* Action Button */}
          {user ? (
            <Link
              href={user.role === "admin" ? "/admin" : "/portal"}
              className="hidden h-8 items-center rounded-full bg-blue-600 px-3 text-[10px] font-bold text-white transition hover:bg-blue-700 md:flex"
            >
              {user.role === "admin" ? "Admin" : "My Portal"}
            </Link>
          ) : (
            <Link
              href="/contact"
              className="hidden h-8 items-center rounded-full bg-blue-600 px-3 text-[10px] font-bold text-white transition hover:bg-blue-700 md:flex"
            >
              Contact
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
