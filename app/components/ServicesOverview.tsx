"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { services as defaultServices, ServiceItem } from "../data/siteData";

export default function ServicesOverview() {
  const [serviceList, setServiceList] = useState<ServiceItem[]>(defaultServices);

  useEffect(() => {
    fetch("/api/content?type=service")
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setServiceList(
            data.map((item: any) => ({
              id: item.id,
              slug: item.slug || String(item.id),
              name: item.title,
              title: item.title,
              shortDescription: item.description || "",
              description: item.content || item.description || "",
              features: item.extra_data?.features || [],
              image: item.image || "/images/services/service1.jpg",
            }))
          );
        }
      })
      .catch(() => undefined);
  }, []);

  return (
    <section className="bg-white py-20">
      <div className="container mx-auto px-4">
        <div className="mx-auto mb-12 max-w-3xl text-center">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-600">Our Services</p>
          <h2 className="mt-2 text-3xl font-black text-slate-900 sm:text-4xl">
            Technology solutions that move businesses forward.
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 xl:grid-cols-3">
          {serviceList.map((service) => (
            <Link
              href={`/services/${service.slug}`}
              key={service.id || service.slug}
              className="group block rounded-3xl border border-slate-200 bg-slate-50/50 p-8 transition duration-200 hover:-translate-y-1 hover:border-blue-200 hover:bg-white hover:shadow-xl"
            >
              <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-100 text-xl font-bold text-blue-700">
                ⚙️
              </div>
              <h3 className="mb-3 text-2xl font-bold text-slate-900 group-hover:text-blue-600 transition">
                {service.name}
              </h3>
              <p className="text-base leading-7 text-slate-600">
                {service.shortDescription}
              </p>
              <span className="mt-6 inline-flex items-center text-xs font-bold text-blue-600 group-hover:text-blue-800">
                Learn more →
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}