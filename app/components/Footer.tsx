export const dynamic = "force-dynamic";

import Link from "next/link";
import { createClient } from "../../lib/supabase/server";

const quickLinks = [
  { name: "Home", href: "/" },
  { name: "About Us", href: "/about" },
  { name: "Services", href: "/services" },
  { name: "Blog Articles", href: "/blog" },
  { name: "Shop & Hardware", href: "/shop" },
  { name: "Contact Us", href: "/contact" },
];

const portalLinks = [
  { name: "User Portal", href: "/portal" },
  { name: "Admin Portal", href: "/admin" },
  { name: "Shopping Cart", href: "/shop/cart" },
  { name: "Member Login", href: "/login" },
];

interface SocialLink {
  id: number;
  platform: string;
  url: string;
  icon: string | null;
  is_active: boolean;
  display_order: number;
}

const iconMap: Record<string, string> = {
  facebook: "fab fa-facebook-f",
  instagram: "fab fa-instagram",
  linkedin: "fab fa-linkedin-in",
  youtube: "fab fa-youtube",
  telegram: "fab fa-telegram-plane",
  twitter: "fab fa-x-twitter",
  whatsapp: "fab fa-whatsapp",
  tiktok: "fab fa-tiktok",
};

export default async function Footer() {
  let socialLinks: SocialLink[] = [];

  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("social_links")
      .select("*")
      .eq("is_active", true)
      .order("display_order", { ascending: true });

    if (error) {
      console.error("Footer social links error:", error.message);
    } else {
      socialLinks = data ?? [];
    }
  } catch (error) {
    console.error("Footer error:", error);
  }

  return (
    <footer className="border-t border-slate-800 bg-slate-950 pt-16 text-white">
      <div className="container mx-auto grid gap-10 px-4 md:grid-cols-2 lg:grid-cols-4">

        {/* Company */}
        <div>
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 font-black text-white shadow-lg shadow-blue-500/30">
              S
            </div>

            <span className="text-xl font-black tracking-wider">
              SYSNET
            </span>
          </div>

          <p className="text-sm leading-7 text-slate-400">
            SysNet Technologies PLC is one of Ethiopia’s premier
            technology service providers, delivering enterprise network
            engineering, cloud computing, and IT hardware solutions.
          </p>
        </div>

        {/* Quick Links */}
        <div>
          <h3 className="mb-4 text-base font-bold text-white">
            Quick Links
          </h3>

          <ul className="space-y-2.5 text-sm text-slate-400">
            {quickLinks.map((link) => (
              <li key={link.name}>
                <Link
                  href={link.href}
                  className="transition hover:text-blue-400"
                >
                  {link.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Portals */}
        <div>
          <h3 className="mb-4 text-base font-bold text-white">
            Portals & Account
          </h3>

          <ul className="space-y-2.5 text-sm text-slate-400">
            {portalLinks.map((link) => (
              <li key={link.name}>
                <Link
                  href={link.href}
                  className="transition hover:text-blue-400"
                >
                  {link.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Headquarters */}
        <div>
          <h3 className="mb-4 text-base font-bold text-white">
            Headquarters
          </h3>

          <ul className="space-y-2.5 text-sm leading-6 text-slate-400">
            <li>
              5 kilo, Mekane Yesus Building, 1st floor,
              Addis Ababa, Ethiopia
            </li>

            <li>+251911249171</li>

            <li>info@sysnet.com.et</li>
          </ul>

          {/* Dynamic Social Media */}
          {socialLinks.length > 0 && (
            <div className="mt-5 flex flex-wrap items-center gap-3">
              {socialLinks.map((social) => {
                const icon =
                  iconMap[social.icon?.trim().toLowerCase() || ""] ||
                  "fas fa-link";

                return (
                  <a
                    key={social.id}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={social.platform}
                    title={social.platform}
                    className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-800 bg-slate-900 text-sm text-slate-300 transition hover:border-blue-500 hover:bg-blue-600 hover:text-white"
                  >
                    <i className={icon} />
                  </a>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Copyright */}
      <div className="mt-12 border-t border-slate-900 py-6">
        <div className="container mx-auto px-4 text-center text-xs text-slate-500">
          © {new Date().getFullYear()} SysNet Technologies PLC.
          All rights reserved.
        </div>
      </div>
    </footer>
  );
}