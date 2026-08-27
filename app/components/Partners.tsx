"use client";

import { useEffect, useState } from "react";
import { partners as defaultPartners, PartnerItem } from "../data/siteData";

export default function Partners() {
  const [partnerList, setPartnerList] = useState<PartnerItem[]>(defaultPartners);

  useEffect(() => {
    fetch("/api/content?type=partner")
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setPartnerList(
            data.map((item: any) => ({
              id: item.id,
              name: item.title,
              logo: item.image || "/images/partners/partner1.jpg",
              website: item.extra_data?.website || "#",
            }))
          );
        }
      })
      .catch(() => undefined);
  }, []);

  return (
    <section className="bg-slate-50 py-20">
      <div className="container mx-auto px-4">
        <div className="mb-12 text-center">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-600">Our Partners</p>
          <h2 className="mt-2 text-3xl font-black text-slate-900 sm:text-4xl">
            Trusted by organizations that value dependable technology.
          </h2>
        </div>

        <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-5">
          {partnerList.map((partner) => (
            <div
              key={partner.id || partner.name}
              className="flex min-h-32 items-center justify-center rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
            >
              <img
                src={partner.logo}
                alt={partner.name}
                className="max-h-16 max-w-full object-contain grayscale hover:grayscale-0 transition duration-300"
                title={partner.name}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}