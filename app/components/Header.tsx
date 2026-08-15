import Link from "next/link";

const navItems = [
  { name: "Home", href: "/" },
  { name: "About", href: "/about" },
  { name: "Services", href: "/services" },
  { name: "Shop", href: "/shop" },
  { name: "Contact", href: "/contact" },
];

export default function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/95 backdrop-blur-sm">
      <div className="bg-black py-2 text-sm text-white">
        <div className="container mx-auto flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-3 text-slate-200">
            <span>8:30 AM - 5:30 PM</span>
            <span className="hidden sm:inline text-slate-400">|</span>
            <span>+251 (0) 911 04 67 05</span>
          </div>
          <div className="flex items-center gap-3 text-slate-200">
            <Link href="/login" className="font-medium transition hover:text-blue-400">Login</Link>
            <span className="text-slate-500">/</span>
            <Link href="/register" className="font-medium transition hover:text-blue-400">Register</Link>
          </div>
        </div>
      </div>

      <div className="container mx-auto flex h-20 max-w-screen-2xl items-center justify-between gap-6">
        <Link href="/" className="flex items-center gap-3" aria-label="SysNet home page">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600 text-lg font-black text-white shadow-lg shadow-blue-200">
            S
          </div>
          <div>
            <div className="text-lg font-black tracking-wide text-slate-900">SYSNET</div>
            <div className="text-[10px] font-semibold uppercase tracking-[0.26em] text-slate-500">Technologies</div>
          </div>
        </Link>

        <nav className="hidden items-center gap-7 text-sm font-semibold text-slate-700 md:flex">
          {navItems.map((item) => (
            <Link key={item.name} href={item.href} className="transition-colors hover:text-blue-600">
              {item.name}
            </Link>
          ))}
        </nav>

        <Link href="/contact" className="hidden rounded-full bg-blue-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-blue-200 transition hover:bg-blue-700 md:inline-flex">
          Contact Us
        </Link>
      </div>
    </header>
  );
}