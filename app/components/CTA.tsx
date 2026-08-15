import Link from "next/link";

export default function CTA() {
  return (
    <section className="bg-gradient-to-r from-blue-700 via-blue-800 to-sky-900 py-20 text-white">
      <div className="container mx-auto px-4 text-center">
        <p className="mb-4 text-sm font-bold uppercase tracking-[0.25em] text-blue-100">Let’s build together</p>
        <h2 className="text-3xl font-black md:text-5xl">Ready to start your next technology project?</h2>
        <p className="mx-auto mt-5 max-w-2xl text-base leading-8 text-blue-50 md:text-lg">
          Whether you need a secure network, a modern website, or a complete digital solution, SysNet is ready to help.
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <Link href="/contact" className="primary-btn bg-white text-blue-700 hover:bg-slate-100">
            Contact Us Now
          </Link>
          <Link href="/shop" className="secondary-btn">
            Visit Shop
          </Link>
        </div>
      </div>
    </section>
  );
}