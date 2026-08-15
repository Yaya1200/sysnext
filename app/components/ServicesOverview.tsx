import Link from "next/link";
import { services } from "../data/siteData";

export default function ServicesOverview() {
  return (
    <section className="bg-white py-20">
      <div className="container mx-auto px-4">
        <div className="mx-auto mb-12 max-w-3xl text-center">
          <p className="section-label">Our Services</p>
          <h2 className="section-title">Technology solutions that move businesses forward.</h2>
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 xl:grid-cols-3">
          {services.map((service) => (
            <Link
              href={`/services/${service.slug}`}
              key={service.slug}
              className="soft-card group block p-8 transition duration-200 hover:-translate-y-1 hover:shadow-xl"
            >
              <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-xl text-blue-700">
                <i className="fa-solid fa-cubes" />
              </div>
              <h3 className="mb-3 text-2xl font-bold text-slate-900">{service.name}</h3>
              <p className="text-base leading-7 text-slate-600">{service.shortDescription}</p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}