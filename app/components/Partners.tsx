const partners = [
  { name: "OLWAY", logo: "/images/partners/partner1.jpg" },
  { name: "PMC", logo: "/images/partners/partner2.jpg" },
  { name: "Addis Continental", logo: "/images/partners/partner3.jpg" },
  { name: "SysNet Client", logo: "/images/partners/partner4.jpg" },
  { name: "Institutional Partner", logo: "/images/partners/partner5.jpg" },
];

export default function Partners() {
  return (
    <section className="bg-slate-50 py-20">
      <div className="container mx-auto px-4">
        <div className="mb-12 text-center">
          <p className="section-label">Our Partners</p>
          <h2 className="section-title">Trusted by organizations that value dependable technology.</h2>
        </div>

        <div className="grid grid-cols-2 gap-8 md:grid-cols-3 lg:grid-cols-5">
          {partners.map((partner) => (
            <div key={partner.name} className="flex min-h-32 items-center justify-center rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
              <div
                className="h-20 w-full rounded-lg bg-contain bg-center bg-no-repeat opacity-85 grayscale hover:opacity-100"
                style={{ backgroundImage: `url('${partner.logo}')` }}
                title={partner.name}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}