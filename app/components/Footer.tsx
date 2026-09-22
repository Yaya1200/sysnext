
import Link from "next/link";
import { createAdminClient } from "../../lib/supabase/admin";

const quickLinks = [
  { name: "Home", href: "/" },
  { name: "About Us", href: "/about" },
  { name: "Services", href: "/services" },
  { name: "Blog Articles", href: "/blog" },
  { name: "Shop & Hardware", href: "/shop" },
  { name: "Contact Us", href: "/contact" },
  { name: "Gallery", href: "/gallery" },
];

const services = [
  { name: "Network Engineering", href: "/services" },
  { name: "Cloud Computing", href: "/services" },
  { name: "IT Infrastructure", href: "/services" },
  { name: "Cybersecurity", href: "/services" },
  { name: "IT Hardware", href: "/shop" },
  { name: "Technical Support", href: "/services" },
  { name: "Enterprise Solutions", href: "/services" },
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
    const supabase = createAdminClient();

    const { data, error } = await supabase
      .from("social_links")
      .select(
        "id, platform, url, icon, is_active, display_order"
      )
      .eq("is_active", true)
      .order("display_order", { ascending: true });

    if (error) {
      console.error(
        "Footer social links error:",
        error.message
      );
    } else {
      socialLinks = data ?? [];
    }
  } catch (error) {
    console.error("Footer error:", error);
  }

  return (
    <footer className="border-t border-slate-800 bg-slate-950 text-white">
      {/* Main Footer */}
      <div className="container mx-auto px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-4 lg:gap-10">
          {/* Company */}
          <div className="lg:pr-6">
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-600 font-black text-white shadow-lg shadow-blue-500/30">
                S
              </div>

              <span className="text-xl font-black tracking-wider">
                SYSNET
              </span>
            </div>

            <p className="max-w-sm text-sm leading-7 text-slate-400">
              SysNet Technologies PLC is one of Ethiopia&apos;s
              premier technology service providers, delivering
              enterprise network engineering, cloud computing,
              cybersecurity, IT infrastructure, and hardware
              solutions.
            </p>

            <div className="mt-6">
              <Link
                href="/about"
                className="inline-flex items-center gap-2 text-sm font-semibold text-blue-400 transition hover:text-blue-300"
              >
                Learn More
                <span aria-hidden="true">→</span>
              </Link>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="mb-5 text-base font-bold text-white">
              Quick Links
            </h3>

            <ul className="space-y-3 text-sm text-slate-400">
              {quickLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="transition-colors duration-200 hover:text-blue-400"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div>
            <h3 className="mb-5 text-base font-bold text-white">
              Our Services
            </h3>

            <ul className="space-y-3 text-sm text-slate-400">
              {services.map((service) => (
                <li key={service.name}>
                  <Link
                    href={service.href}
                    className="transition-colors duration-200 hover:text-blue-400"
                  >
                    {service.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Headquarters */}
          <div>
            <h3 className="mb-5 text-base font-bold text-white">
              Contact Us
            </h3>

            <ul className="space-y-4 text-sm leading-6 text-slate-400">
              {/* Address */}
              <li className="flex items-start gap-3">
                <span
                  className="mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-slate-900 text-blue-400"
                  aria-hidden="true"
                >
                  <i className="fas fa-location-dot" />
                </span>

                <span>
                  5 Kilo, Mekane Yesus Building,
                  <br />
                  1st Floor,
                  <br />
                  Addis Ababa, Ethiopia
                </span>
              </li>

              {/* Phone */}
              <li className="flex items-center gap-3">
                <span
                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-slate-900 text-blue-400"
                  aria-hidden="true"
                >
                  <i className="fas fa-phone" />
                </span>

                <a
                  href="tel:+251911249171"
                  className="transition-colors hover:text-blue-400"
                >
                  +251 911 249 171
                </a>
              </li>

              {/* Email */}
              <li className="flex items-center gap-3">
                <span
                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-slate-900 text-blue-400"
                  aria-hidden="true"
                >
                  <i className="fas fa-envelope" />
                </span>

                <a
                  href="mailto:info@sysnet-et.com"
                  className="break-all transition-colors hover:text-blue-400"
                >
                  info@sysnet-et.com
                </a>
              </li>

              {/* Working Hours */}
              <li className="flex items-start gap-3">
                <span
                  className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-slate-900 text-blue-400"
                  aria-hidden="true"
                >
                  <i className="fas fa-clock" />
                </span>

                <span>
                  <span className="block text-white">
                    Working Hours
                  </span>
                  <span>Mon - Fri: 8:30 AM - 5:30 PM</span>
                </span>
              </li>
            </ul>

            {/* Social Media */}
            {socialLinks.length > 0 && (
              <div className="mt-6">
                <h4 className="mb-3 text-sm font-semibold text-white">
                  Follow Us
                </h4>

                <div className="flex flex-wrap gap-2.5">
                  {socialLinks.map((social) => {
                    const icon =
                      iconMap[
                        social.icon?.trim().toLowerCase() || ""
                      ] || "fas fa-link";

                    return (
                      <a
                        key={social.id}
                        href={social.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={social.platform}
                        title={social.platform}
                        className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-800 bg-slate-900 text-sm text-slate-300 transition-all duration-200 hover:border-blue-500 hover:bg-blue-600 hover:text-white"
                      >
                        <i
                          className={icon}
                          aria-hidden="true"
                        />
                      </a>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Footer */}
      <div className="border-t border-slate-900">
        <div className="container mx-auto flex flex-col items-center justify-between gap-3 px-4 py-6 text-center sm:px-6 md:flex-row md:text-left lg:px-8">
          <p className="text-xs text-slate-500">
            © {new Date().getFullYear()} SysNet Technologies PLC.
            All rights reserved.
          </p>

          <div className="flex items-center gap-5 text-xs text-slate-500">
            <Link
              href="/privacy"
              className="transition-colors hover:text-blue-400"
            >
              Privacy Policy
            </Link>

            <Link
              href="/terms"
              className="transition-colors hover:text-blue-400"
            >
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

