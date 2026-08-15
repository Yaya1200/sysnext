import Link from "next/link";
import ServiceCategories from "../components/ServiceCategories";
import { services } from "../data/siteData";

export default function ServicesPage() {
  return (
    <div className="bg-white">
      <section className="bg-slate-100 py-12">
        <div className="container mx-auto px-4">
          <div className="text-sm text-slate-500">
            Home - <span className="font-semibold text-slate-700">Services</span>
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="flex flex-col gap-12 md:flex-row">
            <aside className="w-full md:w-1/4">
              <ServiceCategories />
            </aside>

            <main className="w-full md:w-3/4">
              <h1 className="mb-6 text-4xl font-bold text-slate-900">Centre for Technology Solutions (CTS)</h1>
              <div className="space-y-5 text-base leading-8 text-slate-700">
                <p>
                  Welcome to the Centre for Technology Solutions (CTS), SysNet’s technology solution delivery arm. We are dedicated to providing a wide range of services to meet your business needs.
                </p>
                <p>
                  Our team of experts is here to help you with everything from computing and networking to sales and consultancy. Please select a category from the sidebar to learn more about our services.
                </p>
              </div>

              <div className="mt-12 grid gap-6 md:grid-cols-2">
                {services.map((service) => (
                  <Link
                    key={service.slug}
                    href={`/services/${service.slug}`}
                    className="rounded-2xl border border-slate-200 bg-slate-50 p-6 transition hover:-translate-y-1 hover:shadow-md"
                  >
                    <h2 className="mb-2 text-2xl font-bold text-slate-900">{service.name}</h2>
                    <p className="text-slate-600">{service.shortDescription}</p>
                  </Link>
                ))}
              </div>
            </main>
          </div>
        </div>
      </section>
    </div>
  );
}