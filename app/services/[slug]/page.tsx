import Image from "next/image";
import Link from "next/link";
import ServiceCategories from "../../components/ServiceCategories";
import { services } from "../../data/siteData";

export default function ServiceDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = params ? undefined : undefined;

  return <ServiceDetailContent params={params} />;
}

async function ServiceDetailContent({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const service = services.find((item) => item.slug === slug);

  if (!service) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <h1 className="mb-4 text-4xl font-bold text-slate-900">Service not found</h1>
        <p className="mb-8 text-slate-600">The page you are looking for does not exist or has been moved.</p>
        <Link href="/services" className="primary-btn">
          Back to Services
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-white">
      <section className="bg-slate-100 py-12">
        <div className="container mx-auto px-4">
          <div className="text-sm text-slate-500">
            Home - Services - <span className="font-semibold text-slate-700">{service.name}</span>
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
              <div className="mb-8 overflow-hidden rounded-3xl bg-slate-50 ring-1 ring-slate-200">
                <div className="grid gap-6 p-6 md:grid-cols-[1.2fr_0.8fr] md:items-center">
                  <div>
                    <p className="mb-3 text-sm font-bold uppercase tracking-[0.24em] text-blue-600">SysNet Services</p>
                    <h1 className="text-4xl font-bold text-slate-900">{service.title}</h1>
                  </div>
                  <div className="relative h-52 overflow-hidden rounded-2xl bg-white">
                    <Image src={service.image} alt={service.title} fill className="object-cover" />
                  </div>
                </div>
              </div>

              <div className="space-y-6 text-base leading-8 text-slate-700">
                <p>{service.description}</p>
                <ul className="list-disc space-y-2 pl-6">
                  {service.features.map((feature) => (
                    <li key={feature}>{feature}</li>
                  ))}
                </ul>
              </div>
            </main>
          </div>
        </div>
      </section>
    </div>
  );
}