import Link from "next/link";
import { ServiceItem } from "../data/siteData";

interface ServiceCategoriesProps {
  services: ServiceItem[];
}

export default function ServiceCategories({
  services,
}: ServiceCategoriesProps) {
  return (
    <div className="rounded-2xl bg-slate-50 p-6 shadow-sm ring-1 ring-slate-200">
      <h3 className="mb-4 text-xl font-bold text-slate-900">
        Services
      </h3>

      <ul className="space-y-2">
        {services.map((service) => (
          <li key={service.id || service.slug}>
            <Link
              href={`/services/${service.slug}`}
              className="block rounded-lg px-3 py-2 text-slate-700 transition hover:bg-blue-50 hover:text-blue-700"
            >
              {service.name}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}