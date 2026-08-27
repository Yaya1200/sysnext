import Link from "next/link";

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

const socialLinks = [
  { name: "Facebook", href: "https://www.facebook.com/sysnettech/", icon: "fab fa-facebook-f" },
  { name: "LinkedIn", href: "https://www.linkedin.com/company/sysnet-technologies-plc/", icon: "fab fa-linkedin-in" },
  { name: "YouTube", href: "https://www.youtube.com/channel/UCryAjoe84QCT_6itqUN7WZQ", icon: "fab fa-youtube" },
  { name: "Telegram", href: "https://t.me/SysNettec", icon: "fab fa-telegram-plane" },
];

export default function Footer() {
  return (
    <footer className="bg-slate-950 pt-16 text-white border-t border-slate-800">
      <div className="container mx-auto grid gap-10 px-4 md:grid-cols-2 lg:grid-cols-4">
        <div>
          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 font-black text-white shadow-lg shadow-blue-500/30">
              S
            </div>
            <span className="text-xl font-black tracking-wider">SYSNET</span>
          </div>
          <p className="text-sm leading-7 text-slate-400">
            SysNet Technologies PLC is one of Ethiopia’s premier technology service providers, delivering enterprise network engineering, cloud computing, and IT hardware solutions.
          </p>
        </div>

        <div>
          <h3 className="mb-4 text-base font-bold text-white">Quick Links</h3>
          <ul className="space-y-2.5 text-sm text-slate-400">
            {quickLinks.map((link) => (
              <li key={link.name}>
                <Link href={link.href} className="transition hover:text-blue-400">
                  {link.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="mb-4 text-base font-bold text-white">Portals & Account</h3>
          <ul className="space-y-2.5 text-sm text-slate-400">
            {portalLinks.map((link) => (
              <li key={link.name}>
                <Link href={link.href} className="transition hover:text-blue-400">
                  {link.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="mb-4 text-base font-bold text-white">Headquarters</h3>
          <ul className="space-y-2.5 text-sm leading-6 text-slate-400">
            <li>5 kilo, Mekane Yesus Building, 1st floor, Addis Ababa, Ethiopia</li>
            <li>+251 (0) 911 04 67 05</li>
            <li>info@sysnet.com.et</li>
          </ul>

          <div className="mt-5 flex items-center gap-3">
            {socialLinks.map((social) => (
              <a
                key={social.name}
                href={social.href}
                target="_blank"
                rel="noreferrer"
                className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-800 bg-slate-900 text-sm text-slate-300 transition hover:border-blue-500 hover:bg-blue-600 hover:text-white"
                aria-label={social.name}
              >
                <i className={social.icon}></i>
              </a>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-12 border-t border-slate-900 py-6">
        <div className="container mx-auto px-4 text-center text-xs text-slate-500">
          © {new Date().getFullYear()} SysNet Technologies PLC. All rights reserved.
        </div>
      </div>
    </footer>
  );
}