import Link from "next/link";
import ServiceCategories from "../components/ServiceCategories";
import { services as defaultServices, ServiceItem } from "../data/siteData";
import { createClient } from "../../lib/supabase/server";

export default async function ServicesPage() {
  let serviceList: ServiceItem[] = defaultServices;

  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("content_items")
      .select("*")
      .eq("content_type", "service")
      .order("id", { ascending: false });

    if (!error && data && data.length > 0) {
      serviceList = data.map((item) => ({
        id: item.id,
        slug: item.slug || String(item.id),
        name: item.title,
        title: item.title,
        shortDescription: item.description || "",
        description: item.content || item.description || "",
        features: item.extra_data?.features || [],
        image: item.image || "/images/services/service1.jpg",
      }));
    }
  } catch (error) {
    console.error("Failed to load services:", error);
  }

  return (
    <div className="bg-white">
      <section className="bg-slate-100 py-12">
        <div className="container mx-auto px-4">
          <div className="text-sm text-slate-500">
            Home -{" "}
            <span className="font-semibold text-slate-700">
              Services
            </span>
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="flex flex-col gap-12 md:flex-row">
            <aside className="w-full md:w-1/4">
              <ServiceCategories services={serviceList} />
            </aside>

            <main className="w-full md:w-3/4">
              <h1 className="mb-6 text-4xl font-bold text-slate-900">
                Centre for Technology Solutions (CTS)
              </h1>

              <div className="space-y-5 text-base leading-8 text-slate-700">
                <p>
                  Welcome to the Centre for Technology Solutions (CTS),
                  SysNet’s technology solution delivery arm. We are dedicated
                  to providing a wide range of services to meet your business
                  needs.
                </p>

                <p>
                  Our team of experts is here to help you with everything from
                  computing and networking to sales and consultancy. Please
                  select a category from the sidebar or browse our full
                  services below.
                </p>
              </div>

              <div className="mt-12 grid gap-6 md:grid-cols-2">
                {serviceList.map((service) => (
                  <Link
                    key={service.id || service.slug}
                    href={`/services/${service.slug}`}
                    className="group rounded-2xl border border-slate-200 bg-slate-50 p-6 transition hover:-translate-y-1 hover:border-blue-300 hover:shadow-lg"
                  >
                    <h2 className="mb-2 text-2xl font-bold text-slate-900 transition group-hover:text-blue-600">
                      {service.name}
                    </h2>

                    <p className="text-sm leading-relaxed text-slate-600">
                      {service.shortDescription}
                    </p>

                    <span className="mt-4 inline-flex items-center text-xs font-bold text-blue-600">
                      Learn More →
                    </span>
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