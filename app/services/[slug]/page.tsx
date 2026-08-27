import Image from "next/image";
import Link from "next/link";
import ServiceCategories from "../../components/ServiceCategories";
import { services as defaultServices, ServiceItem } from "../../data/siteData";
import { createClient } from "../../../lib/supabase/server";

export default async function ServiceDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  let service: ServiceItem | null = null;

  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("content_items")
      .select("*")
      .eq("content_type", "service")
      .or(`slug.eq.${slug},id.eq.${Number(slug) || 0}`)
      .maybeSingle();

    if (data) {
      service = {
        id: data.id,
        slug: data.slug || String(data.id),
        name: data.title,
        title: data.title,
        shortDescription: data.description || "",
        description: data.content || data.description || "",
        features: Array.isArray(data.extra_data?.features) ? data.extra_data.features : [],
        image: data.image || "/images/services/service1.jpg",
      };
    }
  } catch {
    // ignore
  }

  if (!service) {
    service = defaultServices.find((item) => item.slug === slug || String(item.id) === slug) || null;
  }

  if (!service) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <h1 className="mb-4 text-4xl font-bold text-slate-900">Service not found</h1>
        <p className="mb-8 text-slate-600">The service you are looking for does not exist or has been moved.</p>
        <Link href="/services" className="rounded-xl bg-blue-600 px-6 py-3 font-bold text-white shadow-lg hover:bg-blue-700">
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
            <Link href="/" className="hover:underline">Home</Link> - <Link href="/services" className="hover:underline">Services</Link> - <span className="font-semibold text-slate-700">{service.name}</span>
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
                    <img src={service.image} alt={service.title} className="h-full w-full object-cover" />
                  </div>
                </div>
              </div>

              <div className="space-y-6 text-base leading-8 text-slate-700">
                <p className="text-lg leading-relaxed text-slate-800 font-medium">
                  {service.shortDescription}
                </p>
                <div className="whitespace-pre-wrap">
                  {service.description}
                </div>

                {service.features && service.features.length > 0 && (
                  <div className="mt-8 rounded-2xl bg-slate-50 p-6 border border-slate-200">
                    <h3 className="text-lg font-bold text-slate-900 mb-4">Key Capabilities & Features:</h3>
                    <ul className="grid gap-3 sm:grid-cols-2">
                      {service.features.map((feature, idx) => (
                        <li key={idx} className="flex items-center gap-2 text-sm text-slate-700">
                          <span className="text-blue-600 font-bold">✓</span> {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="pt-6">
                  <Link
                    href="/contact"
                    className="inline-flex rounded-xl bg-blue-600 px-6 py-3 font-bold text-white shadow-lg shadow-blue-500/20 hover:bg-blue-700"
                  >
                    Request a Service Quote →
                  </Link>
                </div>
              </div>
            </main>
          </div>
        </div>
      </section>
    </div>
  );
}