"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { blogs as defaultBlogs, BlogItem } from "../data/siteData";

export default function BlogPage() {
  const [blogs, setBlogs] = useState<BlogItem[]>(defaultBlogs);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetch("/api/content?type=blog")
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setBlogs(
            data.map((item: any) => ({
              id: item.id,
              slug: item.slug || String(item.id),
              title: item.title,
              excerpt: item.description || "",
              content: item.content || "",
              image: item.image || "/images/services/service3.jpg",
              author: item.extra_data?.author || "SysNet Team",
              date: item.extra_data?.date || "Recent",
              category: item.category || "General",
            }))
          );
        }
      })
      .catch(() => undefined);
  }, []);

  const categories = ["All", ...new Set(blogs.map((b) => b.category || "General"))];

  const filteredBlogs = useMemo(() => {
    return blogs.filter((b) => {
      const matchCat = selectedCategory === "All" || b.category === selectedCategory;
      const matchSearch =
        b.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.excerpt.toLowerCase().includes(searchTerm.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [blogs, selectedCategory, searchTerm]);

  return (
    <div className="bg-slate-50 min-h-screen py-16">
      <div className="container mx-auto px-4">
        {/* Blog Hero Banner */}
        <div className="mb-12 overflow-hidden rounded-[32px] bg-gradient-to-r from-slate-950 via-slate-900 to-purple-950 p-8 text-white shadow-xl md:p-12">
          <div className="max-w-2xl">
            <span className="rounded-full bg-purple-500/20 px-3 py-1 text-xs font-bold uppercase tracking-wider text-purple-300">
              SysNet Insights & Tech Updates
            </span>
            <h1 className="mt-4 text-4xl font-black tracking-tight sm:text-5xl">
              Knowledge Base & Articles
            </h1>
            <p className="mt-4 text-base text-slate-300">
              Expert perspectives on IT infrastructure, enterprise cybersecurity, cloud deployment, and business technology.
            </p>
          </div>
        </div>

        {/* Filter & Search */}
        <div className="mb-10 flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between">
          <div className="w-full sm:w-1/2">
            <input
              type="text"
              placeholder="Search articles..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`rounded-xl px-4 py-2 text-xs font-bold transition ${
                  selectedCategory === cat
                    ? "bg-purple-600 text-white shadow-md shadow-purple-500/20"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Blog Grid */}
        {filteredBlogs.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-12 text-center text-slate-500">
            No articles found matching your criteria.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {filteredBlogs.map((blog) => (
              <article
                key={blog.id || blog.slug}
                className="group flex flex-col justify-between overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
              >
                <div>
                  <div className="relative h-56 w-full overflow-hidden bg-slate-100">
                    <img
                      src={blog.image || "/images/services/service3.jpg"}
                      alt={blog.title}
                      className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                    />
                    <span className="absolute top-4 left-4 rounded-full bg-slate-900/80 px-3 py-1 text-[11px] font-bold text-purple-300 backdrop-blur-sm">
                      {blog.category || "Technology"}
                    </span>
                  </div>

                  <div className="p-6">
                    <div className="flex items-center gap-2 text-xs text-slate-400">
                      <span>{blog.author}</span>
                      <span>•</span>
                      <span>{blog.date}</span>
                    </div>

                    <h2 className="mt-3 text-xl font-bold text-slate-900 group-hover:text-purple-700 transition">
                      <Link href={`/blog/${blog.slug}`}>{blog.title}</Link>
                    </h2>

                    <p className="mt-3 line-clamp-3 text-sm text-slate-600 leading-relaxed">
                      {blog.excerpt}
                    </p>
                  </div>
                </div>

                <div className="p-6 pt-0 border-t border-slate-100 mt-4 flex items-center justify-between">
                  <Link
                    href={`/blog/${blog.slug}`}
                    className="inline-flex items-center text-xs font-bold text-purple-700 hover:text-purple-900"
                  >
                    Read Full Article →
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
