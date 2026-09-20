"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  projects as defaultProjects,
  ProjectItem,
} from "../data/siteData";

export default function LatestProjects() {
  const [projectList, setProjectList] =
    useState<ProjectItem[]>(defaultProjects.slice(0, 6));

  useEffect(() => {
    fetch("/api/content?type=project")
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          const formattedProjects: ProjectItem[] = data
            .map((item: any) => ({
              id: item.id,
              title: item.title,
              client: item.subtitle || "Enterprise Client",
              description: item.description || "",
              image:
                item.image || "/images/projects/project1.png",
              category: item.category || "Networking",
              year: item.extra_data?.year || "2024",
            }))
            .sort((a, b) => {
              const aId = Number(a.id) || 0;
              const bId = Number(b.id) || 0;

              return bId - aId;
            })
            .slice(0, 6);

          setProjectList(formattedProjects);
        }
      })
      .catch(() => undefined);
  }, []);

  return (
    <section className="bg-slate-50 py-20">
      <div className="container mx-auto px-4">
        {/* Section heading */}
        <div className="mb-12 text-center">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-600">
            Latest Projects
          </p>

          <h2 className="mt-2 text-3xl font-black text-slate-900 sm:text-4xl">
            Recent solutions built for impact.
          </h2>

          <p className="mx-auto mt-4 max-w-2xl text-base text-slate-600">
            Explore some of our most recent technology solutions and
            infrastructure projects.
          </p>
        </div>

        {/* Latest 6 projects */}
        {projectList.length > 0 ? (
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {projectList.map((project) => (
              <article
                key={
                  project.id ||
                  `${project.title}-${project.client}`
                }
                className="group overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl"
              >
                {/* Project image */}
                <div className="relative h-52 overflow-hidden bg-slate-100">
                  <img
                    src={
                      project.image ||
                      "/images/projects/project1.png"
                    }
                    alt={project.title}
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                  />

                  {/* Image overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/50 via-transparent to-transparent" />

                  {/* Category */}
                  <span className="absolute bottom-4 left-4 rounded-full bg-white/95 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-800 shadow-sm">
                    {project.category}
                  </span>
                </div>

                {/* Project information */}
                <div className="p-7">
                  <p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-blue-600">
                    {project.client}
                  </p>

                  <h3 className="mb-3 text-2xl font-bold text-slate-900 transition group-hover:text-blue-700">
                    {project.title}
                  </h3>

                  <p className="line-clamp-3 text-base leading-7 text-slate-600">
                    {project.description}
                  </p>

                  <Link
                    href="/projects"
                    className="mt-6 inline-flex items-center text-xs font-bold text-blue-700 transition hover:text-blue-900"
                  >
                    View project →
                  </Link>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-12 text-center">
            <p className="text-slate-500">
              No projects available yet.
            </p>
          </div>
        )}

        {/* View all projects */}
        <div className="mt-12 text-center">
          <Link
            href="/projects"
            className="inline-flex rounded-full bg-slate-900 px-8 py-3.5 text-xs font-bold text-white shadow-lg transition hover:bg-blue-700"
          >
            View All Projects →
          </Link>
        </div>
      </div>
    </section>
  );
}
