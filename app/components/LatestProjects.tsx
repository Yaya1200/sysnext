"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { projects as defaultProjects, ProjectItem } from "../data/siteData";

export default function LatestProjects() {
  const [projectList, setProjectList] = useState<ProjectItem[]>(defaultProjects);

  useEffect(() => {
    fetch("/api/content?type=project")
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setProjectList(
            data.map((item: any) => ({
              id: item.id,
              title: item.title,
              client: item.subtitle || "Enterprise Client",
              description: item.description || "",
              image: item.image || "/images/projects/project1.png",
              category: item.category || "Networking",
              year: item.extra_data?.year || "2024",
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
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-600">Latest Projects</p>
          <h2 className="mt-2 text-3xl font-black text-slate-900 sm:text-4xl">
            Recent solutions built for impact.
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {projectList.map((project) => (
            <div
              key={project.id || `${project.title}-${project.client}`}
              className="group overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-xl"
            >
              <div
                className="h-52 bg-cover bg-center transition duration-300 group-hover:scale-105"
                style={{
                  backgroundImage: `linear-gradient(180deg, rgba(15,23,42,0.1), rgba(15,23,42,0.4)), url('${project.image}')`,
                }}
              />

              <div className="p-7">
                <p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-blue-600">
                  {project.client}
                </p>
                <h3 className="mb-3 text-2xl font-bold text-slate-900">{project.title}</h3>
                <p className="text-base leading-7 text-slate-600">{project.description}</p>
                <Link
                  href="/services"
                  className="mt-6 inline-flex items-center text-xs font-bold text-blue-700 transition hover:text-blue-900"
                >
                  Learn more →
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}