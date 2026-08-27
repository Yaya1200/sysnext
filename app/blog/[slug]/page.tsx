import Link from "next/link";
import { notFound } from "next/navigation";
import { blogs as defaultBlogs, BlogItem } from "../../data/siteData";
import { createClient } from "../../../lib/supabase/server";

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  let blog: BlogItem | null = null;

  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("content_items")
      .select("*")
      .eq("content_type", "blog")
      .or(`slug.eq.${slug},id.eq.${Number(slug) || 0}`)
      .maybeSingle();

    if (data) {
      blog = {
        id: data.id,
        slug: data.slug || String(data.id),
        title: data.title,
        excerpt: data.description || "",
        content: data.content || "",
        image: data.image || "/images/services/service3.jpg",
        author: data.extra_data?.author || "SysNet Team",
        date: data.extra_data?.date || "Recent",
        category: data.category || "General",
      };
    }
  } catch {
    // ignore
  }

  if (!blog) {
    blog = defaultBlogs.find((b) => b.slug === slug || String(b.id) === slug) || null;
  }

  if (!blog) {
    notFound();
  }

  return (
    <article className="bg-white py-16">
      <div className="container mx-auto max-w-4xl px-4">
        <Link
          href="/blog"
          className="inline-flex items-center gap-2 text-sm font-bold text-purple-700 hover:text-purple-900 mb-8"
        >
          ← Back to all articles
        </Link>

        <div>
          <span className="rounded-full bg-purple-100 px-3 py-1 text-xs font-bold text-purple-800">
            {blog.category || "Technology"}
          </span>

          <h1 className="mt-4 text-3xl font-black tracking-tight text-slate-900 sm:text-5xl">
            {blog.title}
          </h1>

          <div className="mt-4 flex items-center gap-3 text-sm text-slate-500 border-b border-slate-200 pb-6">
            <span>By <strong>{blog.author}</strong></span>
            <span>•</span>
            <span>{blog.date}</span>
          </div>
        </div>

        {blog.image && (
          <div className="my-8 overflow-hidden rounded-3xl bg-slate-100 shadow-md">
            <img
              src={blog.image}
              alt={blog.title}
              className="h-96 w-full object-cover"
            />
          </div>
        )}

        <div className="prose prose-lg max-w-none text-slate-700 leading-relaxed space-y-6">
          <p className="text-xl font-medium text-slate-800 leading-8">
            {blog.excerpt}
          </p>

          <div className="whitespace-pre-wrap text-base leading-8 text-slate-700 pt-4">
            {blog.content}
          </div>
        </div>

        {/* CTA box at the end of blog */}
        <div className="mt-16 rounded-3xl bg-slate-950 p-8 sm:p-10 text-white shadow-xl">
          <h3 className="text-2xl font-bold">Need assistance with your technology infrastructure?</h3>
          <p className="mt-2 text-sm text-slate-300">
            SysNet Technologies engineers high performance networks and computing solutions tailored to your enterprise.
          </p>
          <div className="mt-6 flex flex-wrap gap-4">
            <Link
              href="/contact"
              className="rounded-xl bg-blue-600 px-6 py-3 text-sm font-bold text-white shadow-lg hover:bg-blue-500"
            >
              Contact Our Engineers
            </Link>
            <Link
              href="/services"
              className="rounded-xl border border-slate-700 bg-slate-800 px-6 py-3 text-sm font-bold text-slate-200 hover:bg-slate-700"
            >
              Explore Services
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}
