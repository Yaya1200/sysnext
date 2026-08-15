import Link from "next/link";

const quickLinks = [
  { name: "Home", href: "/" },
  { name: "About", href: "/about" },
  { name: "Services", href: "/services" },
  { name: "Contact", href: "/contact" },
];

const socialLinks = [
  { name: "Facebook", href: "https://www.facebook.com/sysnettech/", icon: "fab fa-facebook-f" },
  { name: "LinkedIn", href: "https://www.linkedin.com/company/sysnet-technologies-plc/", icon: "fab fa-linkedin-in" },
  { name: "YouTube", href: "https://www.youtube.com/channel/UCryAjoe84QCT_6itqUN7WZQ", icon: "fab fa-youtube" },
  { name: "Telegram", href: "https://t.me/SysNettec", icon: "fab fa-telegram-plane" },
];

export default function Footer() {
  return (
    <footer className="bg-slate-900 pt-16 text-white">
      <div className="container mx-auto grid gap-10 px-4 md:grid-cols-2 lg:grid-cols-4">
        <div>
          <h3 className="mb-5 text-xl font-bold">About SysNet</h3>
          <p className="text-sm leading-7 text-slate-300">
            SysNet is one of Ethiopia’s leading technology service providers, delivering quality-driven IT
            solutions built on trust, accountability, and excellence.
          </p>
        </div>

        <div>
          <h3 className="mb-5 text-xl font-bold">Quick Links</h3>
          <ul className="space-y-3 text-sm text-slate-300">
            {quickLinks.map((link) => (
              <li key={link.name}>
                <Link href={link.href} className="transition hover:text-white">
                  {link.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="mb-5 text-xl font-bold">Address</h3>
          <ul className="space-y-3 text-sm leading-7 text-slate-300">
            <li>5 kilo, Mekane Yesus Building, 1st floor, Addis Ababa, Ethiopia</li>
            <li>www.sysnet-et.com</li>
            <li>+251 911 046 705</li>
          </ul>
        </div>

        <div>
          <h3 className="mb-5 text-xl font-bold">Social Media</h3>
          <div className="flex items-center gap-3">
            {socialLinks.map((social) => (
              <a
                key={social.name}
                href={social.href}
                target="_blank"
                rel="noreferrer"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-700 text-base text-slate-200 transition hover:border-blue-400 hover:text-white"
                aria-label={social.name}
              >
                <i className={social.icon}></i>
              </a>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-12 border-t border-slate-800 py-5">
        <div className="container mx-auto px-4 text-center text-sm text-slate-400">
          © {new Date().getFullYear()} SysWeb All Rights Reserved.
        </div>
      </div>
    </footer>
  );
}