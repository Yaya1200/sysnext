
import Link from "next/link";
import Image from "next/image";
import { createClient } from "../../lib/supabase/server";
import {
  projects as defaultProjects,
  ProjectItem,
} from "../data/siteData";

export const dynamic = "force-dynamic";

export default async function ProjectsPage() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("content_items")
    .select("*")
    .eq("content_type", "project")
    .order("id", { ascending: false });

  let projectList: ProjectItem[] = defaultProjects;

  if (!error && Array.isArray(data) && data.length > 0) {
    projectList = data.map((item: any) => ({
      id: item.id,
      title: item.title,
      client: item.subtitle || "Enterprise Client",
      description: item.description || "",
      image: item.image || "/images/projects/project1.png",
      category: item.category || "Networking",
      year: item.extra_data?.year || "2024",
    }));
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {/* Hero */}
      <section className="bg-slate-950 py-20 text-white">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-4xl text-center">
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-blue-400">
              Our Projects
            </p>

            <h1 className="mt-4 text-4xl font-black tracking-tight sm:text-5xl md:text-6xl">
              Technology solutions built for impact.
            </h1>

            <p className="mx-auto mt-6 max-w-2xl text-base leading-7 text-slate-300 sm:text-lg">
              Explore our portfolio of technology, networking, security,
              infrastructure, and digital transformation projects.
            </p>
          </div>
        </div>
      </section>

      {/* Breadcrumb */}
      <div className="border-b border-slate-200 bg-white">
        <div className="container mx-auto px-4 py-4">
          <nav
            aria-label="Breadcrumb"
            className="flex items-center gap-2 text-sm"
          >
            <Link
              href="/"
              className="text-slate-500 transition hover:text-blue-600"
            >
              Home
            </Link>

            <span className="text-slate-300">/</span>

            <span className="font-semibold text-slate-900">
              Projects
            </span>
          </nav>
        </div>
      </div>

      {/* Projects */}
      <main className="container mx-auto px-4 py-16">
        <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-600">
              Portfolio
            </p>

            <h2 className="mt-2 text-3xl font-black text-slate-900">
              All Projects
            </h2>
          </div>

          <p className="text-sm font-medium text-slate-500">
            {projectList.length} project
            {projectList.length !== 1 ? "s" : ""}
          </p>
        </div>

        {projectList.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-16 text-center shadow-sm">
            <h3 className="text-xl font-bold text-slate-900">
              No projects available
            </h3>

            <p className="mt-2 text-sm text-slate-500">
              Projects will appear here once they are published.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {projectList.map((project) => (
              <article
                key={
                  project.id ||
                  `${project.title}-${project.client}`
                }
                className="group flex flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl"
              >
                {/* Image */}
                <div className="relative h-60 overflow-hidden bg-slate-100">
                  <Image
                    src={
                      project.image ||
                      "/images/projects/project1.png"
                    }
                    alt={project.title}
                    width={800}
                    height={600}
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                  />

                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent" />

                  <span className="absolute bottom-4 left-4 rounded-full bg-white/95 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-800 shadow-sm">
                    {project.category}
                  </span>

                  {project.year && (
                    <span className="absolute bottom-4 right-4 rounded-full bg-slate-950/80 px-3 py-1 text-[10px] font-bold text-white backdrop-blur-sm">
                      {project.year}
                    </span>
                  )}
                </div>

                {/* Content */}
                <div className="flex flex-1 flex-col p-7">
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-600">
                    {project.client}
                  </p>

                  <h3 className="mt-2 text-2xl font-bold text-slate-900 transition group-hover:text-blue-700">
                    {project.title}
                  </h3>

                  <p className="mt-3 line-clamp-4 text-sm leading-6 text-slate-600">
                    {project.description ||
                      "A technology solution delivered by SysNet Technologies."}
                  </p>

    
                </div>
              </article>
            ))}
          </div>
        )}
      </main>

      {/* CTA */}
      <section className="bg-white py-16">
        <div className="container mx-auto px-4">
          <div className="rounded-[32px] bg-gradient-to-r from-blue-700 to-blue-900 p-8 text-center text-white shadow-xl md:p-12">
            <h2 className="text-3xl font-black sm:text-4xl">
              Have a project in mind?
            </h2>

            <p className="mx-auto mt-4 max-w-2xl text-sm leading-6 text-blue-100 sm:text-base">
              Talk to our team about your technology, networking,
              infrastructure, or digital transformation requirements.
            </p>

            <Link
              href="/contact"
              className="mt-7 inline-flex rounded-full bg-white px-7 py-3.5 text-xs font-bold text-blue-800 shadow-lg transition hover:bg-slate-100"
            >
              Start a Conversation →
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

