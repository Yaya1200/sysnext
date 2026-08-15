import Link from "next/link";
import { projects } from "../data/siteData";

export default function LatestProjects() {
  return (
    <section className="bg-slate-50 py-20">
      <div className="container mx-auto px-4">
        <div className="mb-12 text-center">
          <p className="section-label">Latest Projects</p>
          <h2 className="section-title">Recent solutions built for impact.</h2>
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3">
          {projects.map((project) => (
            <div key={project.title} className="soft-card overflow-hidden transition duration-200 hover:-translate-y-1 hover:shadow-xl">
              <div
                className="h-48 bg-cover bg-center"
                style={{ backgroundImage: `linear-gradient(180deg, rgba(15,23,42,0.1), rgba(15,23,42,0.35)), url('${project.image}')` }}
              />

              <div className="p-7">
                <p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-blue-600">{project.client}</p>
                <h3 className="mb-3 text-2xl font-bold text-slate-900">{project.title}</h3>
                <p className="text-base leading-7 text-slate-600">{project.description}</p>
                <Link href="/services" className="mt-5 inline-flex font-semibold text-blue-700 transition hover:text-blue-900">
                  Learn more <i className="fa-solid fa-arrow-right ml-2 mt-1 text-sm" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}