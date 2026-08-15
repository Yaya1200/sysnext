"use client";

import { useEffect, useState } from "react";

const stats = [
  { label: "Projects", value: 50 },
  { label: "Clients", value: 30 },
  { label: "Success", value: 5 },
  { label: "Awards", value: 15 },
];

const StatCard = ({ label, value }: { label: string; value: number }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const duration = 1800;
    const step = Math.max(1, Math.ceil(value / (duration / 16)));

    const timer = setInterval(() => {
      setCount((prevCount) => {
        if (prevCount + step >= value) {
          clearInterval(timer);
          return value;
        }
        return prevCount + step;
      });
    }, 16);

    return () => clearInterval(timer);
  }, [value]);

  return (
    <div className="soft-card bg-white p-8 text-center">
      <h3 className="text-5xl font-black text-blue-700">{count}+</h3>
      <p className="mt-3 text-lg font-semibold text-slate-700">{label}</p>
    </div>
  );
};

export default function Stats() {
  return (
    <section className="bg-gradient-to-br from-slate-900 to-blue-950 py-20 text-white">
      <div className="container mx-auto px-4">
        <div className="mb-12 text-center">
          <p className="section-label text-blue-200">Why SysNet</p>
          <h2 className="text-3xl font-black leading-tight text-white md:text-5xl">A trusted technology company driving digital progress.</h2>
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 xl:grid-cols-4">
          {stats.map((stat) => (
            <StatCard key={stat.label} label={stat.label} value={stat.value} />
          ))}
        </div>
      </div>
    </section>
  );
}