import Link from "next/link";
import { serviceCategories } from "../data/siteData";

export default function ServiceCategories() {
  return (
    <div className="rounded-2xl bg-slate-50 p-6 shadow-sm ring-1 ring-slate-200">
      <h3 className="mb-4 text-xl font-bold text-slate-900">Categories</h3>
      <ul className="space-y-2">
        {serviceCategories.map((category) => (
          <li key={category.slug}>
            <Link href={`/services/${category.slug}`} className="block rounded-lg px-3 py-2 text-slate-700 transition hover:bg-blue-50 hover:text-blue-700">
              {category.name}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}