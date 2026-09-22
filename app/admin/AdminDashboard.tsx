"use client";

import { FormEvent, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { createClient } from "../../lib/supabase/client";
import { uploadFile } from "../lib/uploadHelper";
import StatsManager from "./StatsManager";
import GalleryManager from "./GalleryManager";
import SocialMediaManager from "./SocialMediaManager";
import Analytics from "./analytics";
type ContentType = "service" | "partner" | "blog" | "slider" | "project" | "team";

export interface ContentItemRecord {
  id: number;
  content_type: ContentType;
  title: string;
  subtitle?: string | null;
  slug?: string | null;
  description?: string | null;
  content?: string | null;
  image?: string | null;
  category?: string | null;
  extra_data?: Record<string, any> | null;
  created_at?: string;
}

export interface ProductRecord {
  id: number;
  name: string;
  price: number;
  category: string;
  image: string;
  description?: string;
  in_stock?: boolean;
}

export interface ContactMessageRecord {
  id: number;
  name: string;
  email: string;
  phone?: string | null;
  subject: string;
  message: string;
  status: "new" | "in_progress" | "resolved";
  admin_reply?: string | null;
  replied_at?: string | null;
  created_at?: string;
}

export interface OrderRecord {
  id: number;
  user_email: string;
  user_name?: string;
  user_phone?: string;
  items: Array<{ id: number; name: string; price: number; quantity: number }>;
  total_amount: number;
  status: "pending" | "processing" | "completed" | "cancelled";
  notes?: string;
  created_at?: string;
}

type TabType =
  | "overview"
  | "stats"
  | "services"
  | "analytics"
  | "gallery"
  | "products"
  | "partners"
  | "blogs"
  | "slider"
  | "projects"
  | "team"
  | "social"
  | "messages"
  | "orders";

export default function AdminDashboard({ name }: { name: string }) {
  const [activeTab, setActiveTab] = useState<TabType>("overview");
  const [notice, setNotice] = useState<{ text: string; type: "success" | "error" } | null>(null);
  const [adminDisplayName, setAdminDisplayName] = useState(name || "Administrator");

  // Stats counts
  const [counts, setCounts] = useState({
    services: 0,
    products: 0,
    partners: 0,
    blogs: 0,
    slider: 0,
    projects: 0,
    team: 0,
    messages: 0,
    newMessages: 0,
    orders: 0,
  });

  const showNotification = (text: string, type: "success" | "error" = "success") => {
    setNotice({ text, type });
    setTimeout(() => setNotice(null), 4000);
  };

  async function signOut() {
    window.localStorage.removeItem("sysnet-user-demo");
    try {
      await createClient().auth.signOut();
    } catch {}
    window.location.href = "/login";
  }

  // Load stats counts
  const refreshStats = async () => {
    try {
      const [contentRes, prodRes, msgRes, orderRes] = await Promise.all([
        fetch("/api/content").then((r) => r.json()).catch(() => []),
        fetch("/api/products").then((r) => r.json()).catch(() => []),
        fetch("/api/contact").then((r) => r.json()).catch(() => []),
        fetch("/api/orders").then((r) => r.json()).catch(() => []),
      ]);

      const contentItems: ContentItemRecord[] = Array.isArray(contentRes) ? contentRes : [];
      const messages: ContactMessageRecord[] = Array.isArray(msgRes) ? msgRes : [];

      setCounts({
        services: contentItems.filter((i) => i.content_type === "service").length,
        products: Array.isArray(prodRes) ? prodRes.length : 0,
        partners: contentItems.filter((i) => i.content_type === "partner").length,
        blogs: contentItems.filter((i) => i.content_type === "blog").length,
        slider: contentItems.filter((i) => i.content_type === "slider").length,
        projects: contentItems.filter((i) => i.content_type === "project").length,
        team: contentItems.filter((i) => i.content_type === "team").length,
        messages: messages.length,
        newMessages: messages.filter((m) => m.status === "new").length,
        orders: Array.isArray(orderRes) ? orderRes.length : 0,
      });
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    try {
      const local = window.localStorage.getItem("sysnet-user-demo");
      if (local) {
        const parsed = JSON.parse(local);
        if (parsed.full_name) setAdminDisplayName(parsed.full_name);
      }
    } catch {}
    refreshStats();
  }, [name]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      {/* Top Header */}
      <header className="sticky top-0 z-30 border-b border-slate-800 bg-slate-900/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 font-black text-white shadow-lg shadow-blue-500/30">
              S
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black tracking-wide text-white">SYSNET</span>
                <span className="rounded-full bg-blue-500/20 px-2 py-0.5 text-xs font-semibold text-blue-400">
                  Admin Portal
                </span>
              </div>
              <p className="text-xs text-slate-400">Logged in as {adminDisplayName}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/"
              target="_blank"
              className="rounded-lg border border-slate-700 bg-slate-800 px-3.5 py-2 text-xs font-semibold text-slate-200 transition hover:bg-slate-700"
            >
              View Live Website ↗
            </Link>
            <button
              type="button"
              onClick={signOut}
              className="rounded-lg bg-red-600/90 px-3.5 py-2 text-xs font-semibold text-white transition hover:bg-red-700"
            >
              Sign Out
            </button>
          </div>
        </div>
      </header>

      {/* Main Layout */}
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        {/* Floating Notification */}
        {notice && (
          <div
            className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-xl px-5 py-3.5 shadow-2xl transition-all ${
              notice.type === "success"
                ? "bg-emerald-600 text-white"
                : "bg-red-600 text-white"
            }`}
          >
            <span>{notice.type === "success" ? "✓" : "⚠"}</span>
            <p className="text-sm font-semibold">{notice.text}</p>
          </div>
        )}

        <div className="grid gap-8 lg:grid-cols-[260px_1fr]">
          {/* Navigation Sidebar */}
          <aside className="space-y-1.5 rounded-2xl border border-slate-800 bg-slate-900/70 p-3">
            <div className="px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Navigation
            </div>

            <button
              type="button"
              onClick={() => setActiveTab("overview")}
              className={`flex w-full items-center justify-between rounded-xl px-3.5 py-2.5 text-sm font-medium transition ${
                activeTab === "overview"
                  ? "bg-blue-600 text-white shadow-md shadow-blue-600/30"
                  : "text-slate-300 hover:bg-slate-800 hover:text-white"
              }`}
            >
              <span className="flex items-center gap-2.5">
                <span>📊</span> Overview
              </span>
            </button>
            <button
                type="button"
                onClick={() => setActiveTab("stats")}
                className={`flex w-full items-center justify-between rounded-xl px-3.5 py-2.5 text-sm font-medium transition ${
                  activeTab === "stats"
                    ? "bg-blue-600 text-white shadow-md shadow-blue-600/30"
                    : "text-slate-300 hover:bg-slate-800 hover:text-white"
                }`}
              >
                <span className="flex items-center gap-2.5">
                  <span>📈</span> Site Statistics
                </span>
              </button>
              <button
                  type="button"
                  onClick={() => setActiveTab("analytics")}
                  className={`flex w-full items-center justify-between rounded-xl px-3.5 py-2.5 text-sm font-medium transition ${
                    activeTab === "analytics"
                      ? "bg-blue-600 text-white shadow-md shadow-blue-600/30"
                      : "text-slate-300 hover:bg-slate-800 hover:text-white"
                  }`}
                >
                  <span className="flex items-center gap-2.5">
                    <span>📊</span> Website Analytics
                  </span>
                </button>

            <div className="my-2 border-t border-slate-800 pt-2 px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Content Managers
            </div>
            <button
                    type="button"
                    onClick={() => setActiveTab("social")}
                    className={`flex w-full items-center justify-between rounded-xl px-3.5 py-2.5 text-sm font-medium transition ${
                      activeTab === "social"
                        ? "bg-blue-600 text-white shadow-md"
                        : "text-slate-300 hover:bg-slate-800 hover:text-white"
                    }`}
                  >
                    <span className="flex items-center gap-2.5">
                      <span>🔗</span> Social Media
                    </span>
                  </button>

            <button
              type="button"
              onClick={() => setActiveTab("services")}
              className={`flex w-full items-center justify-between rounded-xl px-3.5 py-2.5 text-sm font-medium transition ${
                activeTab === "services"
                  ? "bg-blue-600 text-white shadow-md"
                  : "text-slate-300 hover:bg-slate-800 hover:text-white"
              }`}
            >
              <span className="flex items-center gap-2.5">
                <span>⚙️</span> Services
              </span>
              <span className="rounded-md bg-slate-800 px-2 py-0.5 text-xs text-slate-300">
                {counts.services}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("products")}
              className={`flex w-full items-center justify-between rounded-xl px-3.5 py-2.5 text-sm font-medium transition ${
                activeTab === "products"
                  ? "bg-blue-600 text-white shadow-md"
                  : "text-slate-300 hover:bg-slate-800 hover:text-white"
              }`}
            >
              <span className="flex items-center gap-2.5">
                <span>🛍️</span> Shop Products
              </span>
              <span className="rounded-md bg-slate-800 px-2 py-0.5 text-xs text-slate-300">
                {counts.products}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("partners")}
              className={`flex w-full items-center justify-between rounded-xl px-3.5 py-2.5 text-sm font-medium transition ${
                activeTab === "partners"
                  ? "bg-blue-600 text-white shadow-md"
                  : "text-slate-300 hover:bg-slate-800 hover:text-white"
              }`}
            >
              <span className="flex items-center gap-2.5">
                <span>🤝</span> Partners
              </span>
              <span className="rounded-md bg-slate-800 px-2 py-0.5 text-xs text-slate-300">
                {counts.partners}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("blogs")}
              className={`flex w-full items-center justify-between rounded-xl px-3.5 py-2.5 text-sm font-medium transition ${
                activeTab === "blogs"
                  ? "bg-blue-600 text-white shadow-md"
                  : "text-slate-300 hover:bg-slate-800 hover:text-white"
              }`}
            >
              <span className="flex items-center gap-2.5">
                <span>📝</span> Blog Posts
              </span>
              <span className="rounded-md bg-slate-800 px-2 py-0.5 text-xs text-slate-300">
                {counts.blogs}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("slider")}
              className={`flex w-full items-center justify-between rounded-xl px-3.5 py-2.5 text-sm font-medium transition ${
                activeTab === "slider"
                  ? "bg-blue-600 text-white shadow-md"
                  : "text-slate-300 hover:bg-slate-800 hover:text-white"
              }`}
            >
              <span className="flex items-center gap-2.5">
                <span>🖼️</span> Slider Pictures
              </span>
              <span className="rounded-md bg-slate-800 px-2 py-0.5 text-xs text-slate-300">
                {counts.slider}
              </span>
                            </button>
                            <button
                  type="button"
                  onClick={() => setActiveTab("gallery")}
                  className={`flex w-full items-center justify-between rounded-xl px-3.5 py-2.5 text-sm font-medium transition ${
                    activeTab === "gallery"
                      ? "bg-blue-600 text-white shadow-md"
                      : "text-slate-300 hover:bg-slate-800 hover:text-white"
                  }`}
                >
                  <span className="flex items-center gap-2.5">
                    <span>🖼️</span> Image Gallery
                  </span>

                  <span className="rounded-md bg-slate-800 px-2 py-0.5 text-xs text-slate-300">
                    Gallery
                  </span>
                </button>

            <button
              type="button"
              onClick={() => setActiveTab("projects")}
              className={`flex w-full items-center justify-between rounded-xl px-3.5 py-2.5 text-sm font-medium transition ${
                activeTab === "projects"
                  ? "bg-blue-600 text-white shadow-md"
                  : "text-slate-300 hover:bg-slate-800 hover:text-white"
              }`}
            >
              <span className="flex items-center gap-2.5">
                <span>🚀</span> Latest Projects
              </span>
              <span className="rounded-md bg-slate-800 px-2 py-0.5 text-xs text-slate-300">
                {counts.projects}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("team")}
              className={`flex w-full items-center justify-between rounded-xl px-3.5 py-2.5 text-sm font-medium transition ${
                activeTab === "team"
                  ? "bg-blue-600 text-white shadow-md"
                  : "text-slate-300 hover:bg-slate-800 hover:text-white"
              }`}
            >
              <span className="flex items-center gap-2.5">
                <span>👥</span> Team Members
              </span>
              <span className="rounded-md bg-slate-800 px-2 py-0.5 text-xs text-slate-300">
                {counts.team}
              </span>
            </button>

            <div className="my-2 border-t border-slate-800 pt-2 px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Communications & Sales
            </div>

            <button
              type="button"
              onClick={() => setActiveTab("messages")}
              className={`flex w-full items-center justify-between rounded-xl px-3.5 py-2.5 text-sm font-medium transition ${
                activeTab === "messages"
                  ? "bg-blue-600 text-white shadow-md"
                  : "text-slate-300 hover:bg-slate-800 hover:text-white"
              }`}
            >
              <span className="flex items-center gap-2.5">
                <span>📬</span> Messages
              </span>
              {counts.newMessages > 0 ? (
                <span className="rounded-full bg-emerald-500 px-2 py-0.5 text-xs font-bold text-slate-950">
                  {counts.newMessages} new
                </span>
              ) : (
                <span className="rounded-md bg-slate-800 px-2 py-0.5 text-xs text-slate-400">
                  {counts.messages}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("orders")}
              className={`flex w-full items-center justify-between rounded-xl px-3.5 py-2.5 text-sm font-medium transition ${
                activeTab === "orders"
                  ? "bg-blue-600 text-white shadow-md"
                  : "text-slate-300 hover:bg-slate-800 hover:text-white"
              }`}
            >
              <span className="flex items-center gap-2.5">
                <span>📦</span> Cart Orders
              </span>
              <span className="rounded-md bg-slate-800 px-2 py-0.5 text-xs text-slate-300">
                {counts.orders}
              </span>
            </button>
          </aside>

          {/* Tab Content Area */}
          <main className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 sm:p-8 backdrop-blur-sm">
            {activeTab === "overview" && (
              <OverviewTab counts={counts} setActiveTab={setActiveTab} />
            )}
            {activeTab === "stats" && (
                    <StatsManager showNotification={showNotification} />
                  )}
            {activeTab === "analytics" && <Analytics />}
            {activeTab === "services" && (
              <ServicesManager showNotification={showNotification} onRefresh={refreshStats} />
            )}
            {activeTab === "products" && (
              <ProductManager showNotification={showNotification} onRefresh={refreshStats} />
            )}
            {activeTab === "partners" && (
              <PartnersManager showNotification={showNotification} onRefresh={refreshStats} />
            )}
            {activeTab === "blogs" && (
              <BlogsManager showNotification={showNotification} onRefresh={refreshStats} />
            )}
            {activeTab === "slider" && (
              <SliderManager showNotification={showNotification} onRefresh={refreshStats} />

            )}
            {activeTab === "social" && <SocialMediaManager />}
            {activeTab === "gallery" && (
                            <GalleryManager
                              showNotification={showNotification}
                            />
                          )}
            {activeTab === "projects" && (
              <ProjectsManager showNotification={showNotification} onRefresh={refreshStats} />
            )}
            {activeTab === "team" && (
              <TeamManager showNotification={showNotification} onRefresh={refreshStats} />
            )}
            {activeTab === "messages" && (
              <MessagesManager showNotification={showNotification} onRefresh={refreshStats} />
            )}
            {activeTab === "orders" && (
              <OrdersManager showNotification={showNotification} onRefresh={refreshStats} />
            )}
          </main>
        </div>
      </div>
    </div>
  );
}

// ----------------------------------------------------
// 1. Overview Tab
// ----------------------------------------------------
function OverviewTab({
  counts,
  setActiveTab,
}: {
  counts: any;
  setActiveTab: (t: TabType) => void;
}) {
  const cards = [
    { title: "Services", count: counts.services, tab: "services" as TabType, icon: "⚙️", color: "from-blue-600 to-indigo-600" },
    { title: "Shop Products", count: counts.products, tab: "products" as TabType, icon: "🛍️", color: "from-emerald-600 to-teal-600" },
    { title: "Partners", count: counts.partners, tab: "partners" as TabType, icon: "🤝", color: "from-amber-600 to-orange-600" },
    { title: "Blogs", count: counts.blogs, tab: "blogs" as TabType, icon: "📝", color: "from-purple-600 to-pink-600" },
    { title: "Slider Pictures", count: counts.slider, tab: "slider" as TabType, icon: "🖼️", color: "from-cyan-600 to-blue-600" },
    { title: "Latest Projects", count: counts.projects, tab: "projects" as TabType, icon: "🚀", color: "from-rose-600 to-red-600" },
    { title: "Team Members", count: counts.team, tab: "team" as TabType, icon: "👥", color: "from-violet-600 to-purple-600" },
    { title: "Contact Messages", count: counts.messages, tab: "messages" as TabType, icon: "📬", color: "from-sky-600 to-blue-600" },
  ];

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-2xl font-black text-white">SysNet Administration Dashboard</h2>
        <p className="mt-1 text-sm text-slate-400">
          Manage all content, services, products, team, partners, hero slides, and customer inquiries in real time.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => (
          <button
            key={card.title}
            type="button"
            onClick={() => setActiveTab(card.tab)}
            className="group relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-950/80 p-5 text-left transition hover:-translate-y-1 hover:border-slate-700 hover:shadow-xl"
          >
            <div className="flex items-center justify-between">
              <span className="text-2xl">{card.icon}</span>
              <span className="rounded-full bg-slate-800 px-2.5 py-1 text-xs font-bold text-slate-300 group-hover:bg-blue-600 group-hover:text-white transition">
                Manage →
              </span>
            </div>
            <div className="mt-4 text-3xl font-black text-white">{card.count}</div>
            <div className="text-sm font-medium text-slate-400">{card.title}</div>
          </button>
        ))}
      </div>

      <div className="mt-8 rounded-2xl border border-slate-800 bg-slate-950/60 p-6">
        <h3 className="text-lg font-bold text-white">Quick Administration Actions</h3>
        <p className="mt-1 text-xs text-slate-400">Jump directly to common tasks:</p>
        <div className="mt-4 flex flex-wrap gap-3">
          <button
            onClick={() => setActiveTab("services")}
            className="rounded-xl border border-slate-700 bg-slate-800 px-4 py-2 text-xs font-bold text-slate-200 hover:bg-slate-700"
          >
            + Add New Service
          </button>
          <button
            onClick={() => setActiveTab("products")}
            className="rounded-xl border border-slate-700 bg-slate-800 px-4 py-2 text-xs font-bold text-slate-200 hover:bg-slate-700"
          >
            + Add Product to Shop
          </button>
          <button
            onClick={() => setActiveTab("blogs")}
            className="rounded-xl border border-slate-700 bg-slate-800 px-4 py-2 text-xs font-bold text-slate-200 hover:bg-slate-700"
          >
            + Publish Blog Article
          </button>
          <button
            onClick={() => setActiveTab("messages")}
            className="rounded-xl border border-blue-500/40 bg-blue-600/20 px-4 py-2 text-xs font-bold text-blue-300 hover:bg-blue-600 hover:text-white"
          >
            Check Inbox & Respond ({counts.newMessages} new)
          </button>
        </div>
      </div>
    </div>
  );
}

// ----------------------------------------------------
// 2. Services Manager
// ----------------------------------------------------
function ServicesManager({
  showNotification,
  onRefresh,
}: {
  showNotification: (msg: string, type?: "success" | "error") => void;
  onRefresh: () => void;
}) {
  const [items, setItems] = useState<ContentItemRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  // Form State
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [shortDesc, setShortDesc] = useState("");
  const [desc, setDesc] = useState("");
  const [image, setImage] = useState("/images/services/service1.jpg");
  const [features, setFeatures] = useState("");

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/content?type=service&fallback=false");
      const data = await res.json();
      setItems(Array.isArray(data) ? data : []);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleSave = async (e: FormEvent) => {
    e.preventDefault();
    const featuresList = features
      .split("\n")
      .map((f) => f.trim())
      .filter(Boolean);

    const payload = {
      content_type: "service",
      title: name,
      slug: slug || name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      description: shortDesc,
      content: desc,
      image,
      extra_data: { features: featuresList },
    };

    try {
      if (editingId) {
        const res = await fetch("/api/content", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: editingId, ...payload }),
        });
        if (!res.ok) throw new Error("Update failed");
        showNotification("Service updated successfully");
      } else {
        const res = await fetch("/api/content", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error("Create failed");
        showNotification("Service added successfully");
      }

      resetForm();
      load();
      onRefresh();
    } catch (err: any) {
      showNotification(err.message || "Operation failed", "error");
    }
  };

  const startEdit = (item: ContentItemRecord) => {
    setEditingId(item.id);
    setName(item.title);
    setSlug(item.slug || "");
    setShortDesc(item.description || "");
    setDesc(item.content || "");
    setImage(item.image || "/images/services/service1.jpg");
    setFeatures(
      item.extra_data?.features && Array.isArray(item.extra_data.features)
        ? item.extra_data.features.join("\n")
        : ""
    );
    setIsAdding(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to remove this service?")) return;
    try {
      const res = await fetch(`/api/content?id=${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");
      showNotification("Service removed");
      load();
      onRefresh();
    } catch (err: any) {
      showNotification(err.message || "Delete failed", "error");
    }
  };

  const resetForm = () => {
    setName("");
    setSlug("");
    setShortDesc("");
    setDesc("");
    setImage("/images/services/service1.jpg");
    setFeatures("");
    setEditingId(null);
    setIsAdding(false);
  };

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-black text-white">Services Management</h2>
          <p className="text-xs text-slate-400">
            Add or remove services presented across the Services page and Homepage.
          </p>
        </div>
        <button
          onClick={() => {
            if (isAdding) resetForm();
            else setIsAdding(true);
          }}
          className="rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-bold text-white shadow-lg shadow-blue-600/30 hover:bg-blue-500"
        >
          {isAdding ? "✕ Cancel" : "+ Add New Service"}
        </button>
      </div>

      {isAdding && (
        <form
          onSubmit={handleSave}
          className="mt-6 rounded-2xl border border-slate-800 bg-slate-950 p-6 space-y-4"
        >
          <h3 className="font-bold text-white">
            {editingId ? "Edit Service" : "New Service Details"}
          </h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-400">
                Service Name *
              </label>
              <input
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Cloud & Virtualization"
                className="w-full rounded-xl border border-slate-800 bg-slate-900 px-3.5 py-2.5 text-sm text-white outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-400">
                URL Slug (optional)
              </label>
              <input
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="e.g. cloud-and-virtualization"
                className="w-full rounded-xl border border-slate-800 bg-slate-900 px-3.5 py-2.5 text-sm text-white outline-none focus:border-blue-500"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="mb-1 block text-xs font-medium text-slate-400">
                Short Description (shown on cards) *
              </label>
              <input
                required
                value={shortDesc}
                onChange={(e) => setShortDesc(e.target.value)}
                placeholder="Brief 1-2 sentence overview of this service"
                className="w-full rounded-xl border border-slate-800 bg-slate-900 px-3.5 py-2.5 text-sm text-white outline-none focus:border-blue-500"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="mb-1 block text-xs font-medium text-slate-400">
                Detailed Overview
              </label>
              <textarea
                rows={3}
                value={desc}
                onChange={(e) => setDesc(e.target.value)}
                placeholder="Full description of the service and capabilities..."
                className="w-full rounded-xl border border-slate-800 bg-slate-900 px-3.5 py-2.5 text-sm text-white outline-none focus:border-blue-500"
              />
            </div>
            <div className="flex items-center gap-2">
              <label className="mb-1 block text-xs font-medium text-slate-400">Image Upload</label>
              <input
                type="file"
                accept="image/*"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    try {
                      const url = await uploadFile(file, true);
                      setImage(url);
                    } catch (err: any) {
                      showNotification(err.message || 'Upload failed', 'error');
                    }
                  }
                }}
                className="file:mr-4 file:rounded-full file:border-0 file:bg-blue-600 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-blue-500"
              />
            </div>
            <div className="mt-2">
              <label className="mb-1 block text-xs font-medium text-slate-400">Or paste Image URL</label>
              <input
                value={image}
                onChange={(e) => setImage(e.target.value)}
                placeholder="/images/services/service1.jpg"
                className="w-full rounded-xl border border-slate-800 bg-slate-900 px-3.5 py-2.5 text-sm text-white outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-400">
                Key Features (one per line)
              </label>
              <textarea
                rows={2}
                value={features}
                onChange={(e) => setFeatures(e.target.value)}
                placeholder="Feature 1&#10;Feature 2&#10;Feature 3"
                className="w-full rounded-xl border border-slate-800 bg-slate-900 px-3.5 py-2.5 text-sm text-white outline-none focus:border-blue-500"
              />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={resetForm}
              className="rounded-xl border border-slate-700 px-4 py-2 text-xs font-bold text-slate-300 hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-xl bg-blue-600 px-5 py-2 text-xs font-bold text-white hover:bg-blue-500"
            >
              {editingId ? "Save Changes" : "Create Service"}
            </button>
          </div>
        </form>
      )}

      {/* Services List */}
      <div className="mt-6 space-y-3">
        {loading ? (
          <p className="text-slate-500 text-sm">Loading services...</p>
        ) : items.length === 0 ? (
          <p className="text-slate-500 text-sm">No services found.</p>
        ) : (
          items.map((item) => (
            <div
              key={item.id}
              className="flex flex-col gap-4 rounded-xl border border-slate-800 bg-slate-950 p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-slate-800">
                  {item.image && (
                    <img
                      src={item.image}
                      alt={item.title}
                      className="h-full w-full object-cover"
                    />
                  )}
                </div>
                <div>
                  <h4 className="font-bold text-white">{item.title}</h4>
                  <p className="line-clamp-1 text-xs text-slate-400">
                    {item.description || "No short description"}
                  </p>
                  <span className="text-[10px] text-blue-400">
                    /services/{item.slug || item.id}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-center">
                <button
                  type="button"
                  onClick={() => startEdit(item)}
                  className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-200 hover:bg-slate-700"
                >
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(item.id)}
                  className="rounded-lg bg-red-950/60 border border-red-800/60 px-3 py-1.5 text-xs font-semibold text-red-400 hover:bg-red-900"
                >
                  Remove
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

// ----------------------------------------------------
// 3. Product Manager (Shop)
// ----------------------------------------------------
function ProductManager({
  showNotification,
  onRefresh,
}: {
  showNotification: (msg: string, type?: "success" | "error") => void;
  onRefresh: () => void;
}) {
  const [products, setProducts] = useState<ProductRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  // Form State
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("Networking");
  const [image, setImage] = useState("/products/product1.jpg");
  const [desc, setDesc] = useState("");
  const [inStock, setInStock] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/products?fallback=false");
      const data = await res.json();
      setProducts(Array.isArray(data) ? data : []);
    } catch {
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleSave = async (e: FormEvent) => {
    e.preventDefault();
    const payload = {
      name,
      price: Number(price),
      category,
      image,
      description: desc,
      in_stock: inStock,
    };

    try {
      if (editingId) {
        const res = await fetch("/api/products", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: editingId, ...payload }),
        });
        if (!res.ok) throw new Error("Update product failed");
        showNotification("Product updated successfully");
      } else {
        const res = await fetch("/api/products", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error("Add product failed");
        showNotification("Product added to shop");
      }

      resetForm();
      load();
      onRefresh();
    } catch (err: any) {
      showNotification(err.message || "Failed to save product", "error");
    }
  };

  const startEdit = (p: ProductRecord) => {
    setEditingId(p.id);
    setName(p.name);
    setPrice(String(p.price));
    setCategory(p.category);
    setImage(p.image);
    setDesc(p.description || "");
    setInStock(p.in_stock !== false);
    setIsAdding(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to remove this product from the shop?")) return;
    try {
      const res = await fetch(`/api/products?id=${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");
      showNotification("Product removed");
      load();
      onRefresh();
    } catch (err: any) {
      showNotification(err.message || "Delete failed", "error");
    }
  };

  const resetForm = () => {
    setName("");
    setPrice("");
    setCategory("Networking");
    setImage("/products/product1.jpg");
    setDesc("");
    setInStock(true);
    setEditingId(null);
    setIsAdding(false);
  };

 const handleFileUpload = async (
  e: React.ChangeEvent<HTMLInputElement>
) => {
  const file = e.target.files?.[0];

  if (!file) return;

  try {
    // Product uploads allow images and PDFs, but both are limited to 5 MiB.
    const url = await uploadFile(file, false);
    setImage(url);
  } catch (error: any) {
    console.error("Upload error:", error);
    showNotification(
      error.message || "Upload failed. Please try again.",
      "error"
    );
  } finally {
    e.target.value = "";
  }
};

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-black text-white">Shop Products</h2>
          <p className="text-xs text-slate-400">
            Manage store catalog, prices, categories, and inventory availability.
          </p>
        </div>
        <button
          onClick={() => {
            if (isAdding) resetForm();
            else setIsAdding(true);
          }}
          className="rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white shadow-lg shadow-emerald-600/30 hover:bg-emerald-500"
        >
          {isAdding ? "✕ Cancel" : "+ Add New Product"}
        </button>
      </div>

      {isAdding && (
        <form
          onSubmit={handleSave}
          className="mt-6 rounded-2xl border border-slate-800 bg-slate-950 p-6 space-y-4"
        >
          <h3 className="font-bold text-white">
            {editingId ? "Edit Product" : "New Product Details"}
          </h3>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="sm:col-span-2">
              <label className="mb-1 block text-xs font-medium text-slate-400">
                Product Name *
              </label>
              <input
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. 24-Port PoE Switch"
                className="w-full rounded-xl border border-slate-800 bg-slate-900 px-3.5 py-2.5 text-sm text-white outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-400">
                Price (ETB) *
              </label>
              <input
                required
                type="number"
                step="0.01"
                min="0"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="199.99"
                className="w-full rounded-xl border border-slate-800 bg-slate-900 px-3.5 py-2.5 text-sm text-white outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-400">
                Category *
              </label>
              <input
                required
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="e.g. Networking, Computers, Hardware"
                className="w-full rounded-xl border border-slate-800 bg-slate-900 px-3.5 py-2.5 text-sm text-white outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-400">
                Image / PDF Upload *
              </label>
              <input
                type="file"
                accept="image/*,application/pdf"
                onChange={handleFileUpload}
                className="w-full rounded-xl border border-slate-800 bg-slate-900 px-3.5 py-2.5 text-sm text-white outline-none focus:border-emerald-500"
              />
            </div>
            <div className="flex items-center gap-3 pt-6">
              <label className="flex items-center gap-2 text-xs font-medium text-slate-300">
                <input
                  type="checkbox"
                  checked={inStock}
                  onChange={(e) => setInStock(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-700 bg-slate-900 text-emerald-600"
                />
                In Stock & Available
              </label>
            </div>
            <div className="sm:col-span-3">
              <label className="mb-1 block text-xs font-medium text-slate-400">
                Description
              </label>
              <textarea
                rows={2}
                value={desc}
                onChange={(e) => setDesc(e.target.value)}
                placeholder="Detailed specifications, features, warranty info..."
                className="w-full rounded-xl border border-slate-800 bg-slate-900 px-3.5 py-2.5 text-sm text-white outline-none focus:border-emerald-500"
              />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={resetForm}
              className="rounded-xl border border-slate-700 px-4 py-2 text-xs font-bold text-slate-300 hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-xl bg-emerald-600 px-5 py-2 text-xs font-bold text-white hover:bg-emerald-500"
            >
              {editingId ? "Save Product" : "Add Product"}
            </button>
          </div>
        </form>
      )}

      {/* Product List */}
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {loading ? (
          <p className="text-slate-500 text-sm">Loading products...</p>
        ) : products.length === 0 ? (
          <p className="text-slate-500 text-sm">No products found.</p>
        ) : (
          products.map((p) => (
            <div
              key={p.id}
              className="flex flex-col justify-between rounded-2xl border border-slate-800 bg-slate-950 p-4"
            >
              <div>
                <div className="relative mb-3 h-36 w-full overflow-hidden rounded-xl bg-slate-900">
                  <img
                    src={p.image || "/products/product1.jpg"}
                    alt={p.name}
                    className="h-full w-full object-cover"
                  />
                  <span className="absolute top-2 right-2 rounded-md bg-slate-900/80 px-2 py-0.5 text-[10px] font-bold text-emerald-400 backdrop-blur-sm">
                    {p.category}
                  </span>
                </div>
                <h4 className="font-bold text-white text-base">{p.name}</h4>
                <p className="mt-1 line-clamp-2 text-xs text-slate-400">
                  {p.description || "No description provided."}
                </p>
              </div>

              <div className="mt-4 flex items-center justify-between border-t border-slate-900 pt-3">
                <span className="text-base font-black text-emerald-400">
                  {Number(p.price).toFixed(2)} Birr
                </span>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => startEdit(p)}
                    className="rounded-lg border border-slate-700 bg-slate-800 px-2.5 py-1 text-xs font-semibold text-slate-200 hover:bg-slate-700"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(p.id)}
                    className="rounded-lg bg-red-950/60 border border-red-800/60 px-2.5 py-1 text-xs font-semibold text-red-400 hover:bg-red-900"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

// ----------------------------------------------------
// 4. Partners Manager
// ----------------------------------------------------
function PartnersManager({
  showNotification,
  onRefresh,
}: {
  showNotification: (msg: string, type?: "success" | "error") => void;
  onRefresh: () => void;
}) {
  const [partners, setPartners] = useState<ContentItemRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [name, setName] = useState("");
  const [logo, setLogo] = useState("/images/partners/partner1.jpg");
  const [website, setWebsite] = useState("https://example.com");

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/content?type=partner&fallback=false");
      const data = await res.json();
      setPartners(Array.isArray(data) ? data : []);
    } catch {
      setPartners([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleAdd = async (e: FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content_type: "partner",
          title: name,
          image: logo,
          extra_data: { website },
        }),
      });
      if (!res.ok) throw new Error("Failed to add partner");
      showNotification("Partner added successfully");
      setName("");
      setLogo("/images/partners/partner1.jpg");
      setWebsite("https://example.com");
      setIsAdding(false);
      load();
      onRefresh();
    } catch (err: any) {
      showNotification(err.message || "Failed to add partner", "error");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Remove this partner?")) return;
    try {
      const res = await fetch(`/api/content?id=${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");
      showNotification("Partner removed");
      load();
      onRefresh();
    } catch (err: any) {
      showNotification(err.message || "Delete failed", "error");
    }
  };

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-black text-white">Partners & Clients</h2>
          <p className="text-xs text-slate-400">
            Manage partner brand logos displayed on the homepage and about page.
          </p>
        </div>
        <button
          onClick={() => setIsAdding(!isAdding)}
          className="rounded-xl bg-amber-600 px-4 py-2.5 text-xs font-bold text-white shadow-lg shadow-amber-600/30 hover:bg-amber-500"
        >
          {isAdding ? "✕ Cancel" : "+ Add Partner"}
        </button>
      </div>

      {isAdding && (
        <form
          onSubmit={handleAdd}
          className="mt-6 rounded-2xl border border-slate-800 bg-slate-950 p-6 space-y-4"
        >
          <h3 className="font-bold text-white">Add New Partner</h3>
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-400">
                Partner Name *
              </label>
              <input
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Cisco Systems"
                className="w-full rounded-xl border border-slate-800 bg-slate-900 px-3.5 py-2.5 text-sm text-white outline-none focus:border-amber-500"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-400">
                Logo Path / URL *
              </label>
              <input
                required
                value={logo}
                onChange={(e) => setLogo(e.target.value)}
                placeholder="/images/partners/partner1.jpg"
                className="w-full rounded-xl border border-slate-800 bg-slate-900 px-3.5 py-2.5 text-sm text-white outline-none focus:border-amber-500"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-400">
                Upload Logo (max 5 MiB)
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  try {
                    const url = await uploadFile(file, true);
                    setLogo(url);
                  } catch (err: any) {
                    showNotification(err.message || "Upload failed", "error");
                  } finally {
                    e.target.value = "";
                  }
                }}
                className="w-full rounded-xl border border-slate-800 bg-slate-900 px-3.5 py-2.5 text-sm text-white outline-none focus:border-amber-500 file:mr-4 file:rounded-full file:border-0 file:bg-amber-600 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-amber-500"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-400">
                Website URL
              </label>
              <input
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                placeholder="https://company.com"
                className="w-full rounded-xl border border-slate-800 bg-slate-900 px-3.5 py-2.5 text-sm text-white outline-none focus:border-amber-500"
              />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="rounded-xl border border-slate-700 px-4 py-2 text-xs font-bold text-slate-300 hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-xl bg-amber-600 px-5 py-2 text-xs font-bold text-white hover:bg-amber-500"
            >
              Save Partner
            </button>
          </div>
        </form>
      )}

      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {loading ? (
          <p className="text-slate-500 text-sm">Loading partners...</p>
        ) : partners.length === 0 ? (
          <p className="text-slate-500 text-sm">No partners found.</p>
        ) : (
          partners.map((partner) => (
            <div
              key={partner.id}
              className="flex flex-col items-center justify-between rounded-2xl border border-slate-800 bg-slate-950 p-4 text-center"
            >
              <div className="flex h-20 w-full items-center justify-center rounded-xl bg-slate-900 p-2">
                <img
                  src={partner.image || "/images/partners/partner1.jpg"}
                  alt={partner.title}
                  className="max-h-14 max-w-full object-contain"
                />
              </div>
              <h4 className="mt-3 font-bold text-white text-sm">{partner.title}</h4>
              <button
                type="button"
                onClick={() => handleDelete(partner.id)}
                className="mt-3 text-xs font-semibold text-red-400 hover:text-red-300"
              >
                Remove
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

// ----------------------------------------------------
// 5. Blogs Manager
// ----------------------------------------------------
function BlogsManager({
  showNotification,
  onRefresh,
}: {
  showNotification: (msg: string, type?: "success" | "error") => void;
  onRefresh: () => void;
}) {
  const [blogs, setBlogs] = useState<ContentItemRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  // Form State
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [category, setCategory] = useState("Networking & Security");
  const [author, setAuthor] = useState("SysNet Team");
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("");
  const [image, setImage] = useState("/images/services/service3.jpg");

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/content?type=blog&fallback=false");
      const data = await res.json();
      setBlogs(Array.isArray(data) ? data : []);
    } catch {
      setBlogs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleSave = async (e: FormEvent) => {
    e.preventDefault();
    const payload = {
      content_type: "blog",
      title,
      slug: slug || title.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      description: excerpt,
      content,
      category,
      image,
      extra_data: {
        author,
        date: new Date().toLocaleDateString("en-US", {
          month: "long",
          day: "numeric",
          year: "numeric",
        }),
      },
    };

    try {
      if (editingId) {
        const res = await fetch("/api/content", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: editingId, ...payload }),
        });
        if (!res.ok) throw new Error("Blog update failed");
        showNotification("Blog article updated");
      } else {
        const res = await fetch("/api/content", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error("Blog post failed");
        showNotification("Blog article published");
      }

      resetForm();
      load();
      onRefresh();
    } catch (err: any) {
      showNotification(err.message || "Failed to save blog", "error");
    }
  };

  const startEdit = (item: ContentItemRecord) => {
    setEditingId(item.id);
    setTitle(item.title);
    setSlug(item.slug || "");
    setCategory(item.category || "Networking & Security");
    setAuthor(item.extra_data?.author || "SysNet Team");
    setExcerpt(item.description || "");
    setContent(item.content || "");
    setImage(item.image || "/images/services/service3.jpg");
    setIsAdding(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this blog article?")) return;
    try {
      const res = await fetch(`/api/content?id=${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");
      showNotification("Blog article deleted");
      load();
      onRefresh();
    } catch (err: any) {
      showNotification(err.message || "Delete failed", "error");
    }
  };

  const resetForm = () => {
    setTitle("");
    setSlug("");
    setCategory("Networking & Security");
    setAuthor("SysNet Team");
    setExcerpt("");
    setContent("");
    setImage("/images/services/service3.jpg");
    setEditingId(null);
    setIsAdding(false);
  };

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-black text-white">Blog & Knowledge Articles</h2>
          <p className="text-xs text-slate-400">
            Publish thought leadership, tech updates, and enterprise guides for visitors.
          </p>
        </div>
        <button
          onClick={() => {
            if (isAdding) resetForm();
            else setIsAdding(true);
          }}
          className="rounded-xl bg-purple-600 px-4 py-2.5 text-xs font-bold text-white shadow-lg shadow-purple-600/30 hover:bg-purple-500"
        >
          {isAdding ? "✕ Cancel" : "+ Publish New Blog"}
        </button>
      </div>

      {isAdding && (
        <form
          onSubmit={handleSave}
          className="mt-6 rounded-2xl border border-slate-800 bg-slate-950 p-6 space-y-4"
        >
          <h3 className="font-bold text-white">
            {editingId ? "Edit Blog Article" : "Write New Blog Article"}
          </h3>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="sm:col-span-2">
              <label className="mb-1 block text-xs font-medium text-slate-400">
                Article Title *
              </label>
              <input
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Next-Generation Wi-Fi 7 for Enterprise Offices"
                className="w-full rounded-xl border border-slate-800 bg-slate-900 px-3.5 py-2.5 text-sm text-white outline-none focus:border-purple-500"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-400">
                Category
              </label>
              <input
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="e.g. Cybersecurity, Networking"
                className="w-full rounded-xl border border-slate-800 bg-slate-900 px-3.5 py-2.5 text-sm text-white outline-none focus:border-purple-500"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-400">
                Author
              </label>
              <input
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                placeholder="Bereket Kahsay"
                className="w-full rounded-xl border border-slate-800 bg-slate-900 px-3.5 py-2.5 text-sm text-white outline-none focus:border-purple-500"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-400">
                Cover Image
              </label>
              <input
                value={image}
                onChange={(e) => setImage(e.target.value)}
                placeholder="/images/services/service3.jpg"
                className="w-full rounded-xl border border-slate-800 bg-slate-900 px-3.5 py-2.5 text-sm text-white outline-none focus:border-purple-500"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-400">
                Upload Cover Image (max 5 MiB)
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  try {
                    const url = await uploadFile(file, true);
                    setImage(url);
                  } catch (err: any) {
                    showNotification(err.message || "Upload failed", "error");
                  } finally {
                    e.target.value = "";
                  }
                }}
                className="w-full rounded-xl border border-slate-800 bg-slate-900 px-3.5 py-2.5 text-sm text-white outline-none focus:border-purple-500 file:mr-4 file:rounded-full file:border-0 file:bg-purple-600 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-purple-500"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-400">
                Slug (URL)
              </label>
              <input
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="next-gen-wifi-7"
                className="w-full rounded-xl border border-slate-800 bg-slate-900 px-3.5 py-2.5 text-sm text-white outline-none focus:border-purple-500"
              />
            </div>
            <div className="sm:col-span-3">
              <label className="mb-1 block text-xs font-medium text-slate-400">
                Short Summary / Excerpt *
              </label>
              <textarea
                rows={2}
                required
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
                placeholder="Brief excerpt shown on article previews..."
                className="w-full rounded-xl border border-slate-800 bg-slate-900 px-3.5 py-2.5 text-sm text-white outline-none focus:border-purple-500"
              />
            </div>
            <div className="sm:col-span-3">
              <label className="mb-1 block text-xs font-medium text-slate-400">
                Full Article Content *
              </label>
              <textarea
                rows={6}
                required
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Detailed article body paragraphs, headings, bullet points..."
                className="w-full rounded-xl border border-slate-800 bg-slate-900 px-3.5 py-2.5 text-sm text-white outline-none focus:border-purple-500 font-mono text-xs"
              />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={resetForm}
              className="rounded-xl border border-slate-700 px-4 py-2 text-xs font-bold text-slate-300 hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-xl bg-purple-600 px-5 py-2 text-xs font-bold text-white hover:bg-purple-500"
            >
              {editingId ? "Save Changes" : "Publish Article"}
            </button>
          </div>
        </form>
      )}

      {/* Blogs List */}
      <div className="mt-6 space-y-3">
        {loading ? (
          <p className="text-slate-500 text-sm">Loading blogs...</p>
        ) : blogs.length === 0 ? (
          <p className="text-slate-500 text-sm">No blog posts found.</p>
        ) : (
          blogs.map((b) => (
            <div
              key={b.id}
              className="flex flex-col gap-4 rounded-xl border border-slate-800 bg-slate-950 p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="flex items-center gap-4">
                <div className="h-14 w-20 shrink-0 overflow-hidden rounded-lg bg-slate-800">
                  <img
                    src={b.image || "/images/services/service1.jpg"}
                    alt={b.title}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div>
                  <span className="text-[10px] font-semibold text-purple-400 uppercase tracking-wider">
                    {b.category || "General"}
                  </span>
                  <h4 className="font-bold text-white text-sm">{b.title}</h4>
                  <p className="line-clamp-1 text-xs text-slate-400">
                    {b.description || "No excerpt"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-center">
                <Link
                  href={`/blog/${b.slug || b.id}`}
                  target="_blank"
                  className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-200 hover:bg-slate-700"
                >
                  Preview ↗
                </Link>
                <button
                  type="button"
                  onClick={() => startEdit(b)}
                  className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-200 hover:bg-slate-700"
                >
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(b.id)}
                  className="rounded-lg bg-red-950/60 border border-red-800/60 px-3 py-1.5 text-xs font-semibold text-red-400 hover:bg-red-900"
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

// ----------------------------------------------------
// 6. Slider Pictures Manager
// ----------------------------------------------------
function SliderManager({
  showNotification,
  onRefresh,
}: {
  showNotification: (msg: string, type?: "success" | "error") => void;
  onRefresh: () => void;
}) {
  const [slides, setSlides] = useState<ContentItemRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);

  // Form State
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [image, setImage] = useState("/images/hero/hero1.webp");
  const [link, setLink] = useState("/contact");
  const [buttonText, setButtonText] = useState("Contact Us");

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/content?type=slider&fallback=false");
      const data = await res.json();
      setSlides(Array.isArray(data) ? data : []);
    } catch {
      setSlides([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleAdd = async (e: FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content_type: "slider",
          title,
          subtitle,
          image,
          extra_data: { link, buttonText },
        }),
      });
      if (!res.ok) throw new Error("Failed to add slide");
      showNotification("Hero slide picture added");
      setTitle("");
      setSubtitle("");
      setImage("/images/hero/hero1.webp");
      setIsAdding(false);
      load();
      onRefresh();
    } catch (err: any) {
      showNotification(err.message || "Failed to add slide", "error");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Remove this slider picture?")) return;
    try {
      const res = await fetch(`/api/content?id=${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");
      showNotification("Slide removed");
      load();
      onRefresh();
    } catch (err: any) {
      showNotification(err.message || "Delete failed", "error");
    }
  };

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-black text-white">Homepage Slider Pictures</h2>
          <p className="text-xs text-slate-400">
            Control the hero banners, background photographs, and headline messages on the homepage.
          </p>
        </div>
        <button
          onClick={() => setIsAdding(!isAdding)}
          className="rounded-xl bg-cyan-600 px-4 py-2.5 text-xs font-bold text-white shadow-lg shadow-cyan-600/30 hover:bg-cyan-500"
        >
          {isAdding ? "✕ Cancel" : "+ Add Slider Picture"}
        </button>
      </div>

      {isAdding && (
        <form
          onSubmit={handleAdd}
          className="mt-6 rounded-2xl border border-slate-800 bg-slate-950 p-6 space-y-4"
        >
          <h3 className="font-bold text-white">New Hero Banner Slide</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-400">
                Slide Headline *
              </label>
              <input
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Empowering Enterprise Connectivity"
                className="w-full rounded-xl border border-slate-800 bg-slate-900 px-3.5 py-2.5 text-sm text-white outline-none focus:border-cyan-500"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-400">
                Background Image URL / Path *
              </label>
              <input
                required
                value={image}
                onChange={(e) => setImage(e.target.value)}
                placeholder="/images/hero/hero1.webp"
                className="w-full rounded-xl border border-slate-800 bg-slate-900 px-3.5 py-2.5 text-sm text-white outline-none focus:border-cyan-500"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-400">
                Upload Background Image (max 5 MiB)
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  try {
                    const url = await uploadFile(file, true);
                    setImage(url);
                  } catch (err: any) {
                    showNotification(err.message || "Upload failed", "error");
                  } finally {
                    e.target.value = "";
                  }
                }}
                className="w-full rounded-xl border border-slate-800 bg-slate-900 px-3.5 py-2.5 text-sm text-white outline-none focus:border-cyan-500 file:mr-4 file:rounded-full file:border-0 file:bg-cyan-600 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-cyan-500"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="mb-1 block text-xs font-medium text-slate-400">
                Subtitle Description *
              </label>
              <textarea
                rows={2}
                required
                value={subtitle}
                onChange={(e) => setSubtitle(e.target.value)}
                placeholder="Comprehensive explanation displayed beneath the headline..."
                className="w-full rounded-xl border border-slate-800 bg-slate-900 px-3.5 py-2.5 text-sm text-white outline-none focus:border-cyan-500"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-400">
                Button Target Link
              </label>
              <input
                value={link}
                onChange={(e) => setLink(e.target.value)}
                placeholder="/contact"
                className="w-full rounded-xl border border-slate-800 bg-slate-900 px-3.5 py-2.5 text-sm text-white outline-none focus:border-cyan-500"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-400">
                Button Label
              </label>
              <input
                value={buttonText}
                onChange={(e) => setButtonText(e.target.value)}
                placeholder="Contact Us"
                className="w-full rounded-xl border border-slate-800 bg-slate-900 px-3.5 py-2.5 text-sm text-white outline-none focus:border-cyan-500"
              />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="rounded-xl border border-slate-700 px-4 py-2 text-xs font-bold text-slate-300 hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-xl bg-cyan-600 px-5 py-2 text-xs font-bold text-white hover:bg-cyan-500"
            >
              Save Slide
            </button>
          </div>
        </form>
      )}

      {/* Slides Grid */}
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
        {loading ? (
          <p className="text-slate-500 text-sm">Loading slides...</p>
        ) : slides.length === 0 ? (
          <p className="text-slate-500 text-sm">No slider pictures found.</p>
        ) : (
          slides.map((slide) => (
            <div
              key={slide.id}
              className="relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-950 p-5"
            >
              <div
                className="relative mb-4 h-40 w-full overflow-hidden rounded-xl bg-cover bg-center"
                style={{ backgroundImage: `url('${slide.image || "/images/hero/hero1.webp"}')` }}
              >
                <div className="absolute inset-0 bg-black/40 p-4 flex flex-col justify-end text-white">
                  <h4 className="font-bold text-base">{slide.title}</h4>
                  <p className="line-clamp-2 text-xs text-slate-300">{slide.subtitle}</p>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400">
                  Button: {slide.extra_data?.buttonText || "Contact"}
                </span>
                <button
                  type="button"
                  onClick={() => handleDelete(slide.id)}
                  className="rounded-lg bg-red-950/60 border border-red-800/60 px-3 py-1 text-xs font-semibold text-red-400 hover:bg-red-900"
                >
                  Remove Slide
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

// ----------------------------------------------------
// 7. Latest Projects Manager
// ----------------------------------------------------
function ProjectsManager({
  showNotification,
  onRefresh,
}: {
  showNotification: (msg: string, type?: "success" | "error") => void;
  onRefresh: () => void;
}) {
  const [projects, setProjects] = useState<ContentItemRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);

  // Form State
  const [title, setTitle] = useState("");
  const [client, setClient] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState("/images/projects/project1.png");
  const [category, setCategory] = useState("Networking");

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/content?type=project&fallback=false");
      const data = await res.json();
      setProjects(Array.isArray(data) ? data : []);
    } catch {
      setProjects([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleAdd = async (e: FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content_type: "project",
          title,
          subtitle: client,
          description,
          image,
          category,
        }),
      });
      if (!res.ok) throw new Error("Failed to add project");
      showNotification("Project added successfully");
      setTitle("");
      setClient("");
      setDescription("");
      setImage("/images/projects/project1.png");
      setIsAdding(false);
      load();
      onRefresh();
    } catch (err: any) {
      showNotification(err.message || "Failed to add project", "error");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Remove this project?")) return;
    try {
      const res = await fetch(`/api/content?id=${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");
      showNotification("Project removed");
      load();
      onRefresh();
    } catch (err: any) {
      showNotification(err.message || "Delete failed", "error");
    }
  };

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-black text-white">Latest Projects</h2>
          <p className="text-xs text-slate-400">
            Showcase enterprise case studies, network deployments, and institutional client work.
          </p>
        </div>
        <button
          onClick={() => setIsAdding(!isAdding)}
          className="rounded-xl bg-rose-600 px-4 py-2.5 text-xs font-bold text-white shadow-lg shadow-rose-600/30 hover:bg-rose-500"
        >
          {isAdding ? "✕ Cancel" : "+ Add Project"}
        </button>
      </div>

      {isAdding && (
        <form
          onSubmit={handleAdd}
          className="mt-6 rounded-2xl border border-slate-800 bg-slate-950 p-6 space-y-4"
        >
          <h3 className="font-bold text-white">New Portfolio Project</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-400">
                Project Title *
              </label>
              <input
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. 500-Node Fiber Infrastructure"
                className="w-full rounded-xl border border-slate-800 bg-slate-900 px-3.5 py-2.5 text-sm text-white outline-none focus:border-rose-500"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-400">
                Client / Institution Name *
              </label>
              <input
                required
                value={client}
                onChange={(e) => setClient(e.target.value)}
                placeholder="e.g. Addis Continental Institute"
                className="w-full rounded-xl border border-slate-800 bg-slate-900 px-3.5 py-2.5 text-sm text-white outline-none focus:border-rose-500"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-400">
                Category
              </label>
              <input
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="e.g. Networking, Infrastructure, Web"
                className="w-full rounded-xl border border-slate-800 bg-slate-900 px-3.5 py-2.5 text-sm text-white outline-none focus:border-rose-500"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-400">
                Project Image Path / URL
              </label>
              <input
                value={image}
                onChange={(e) => setImage(e.target.value)}
                placeholder="/images/projects/project1.png"
                className="w-full rounded-xl border border-slate-800 bg-slate-900 px-3.5 py-2.5 text-sm text-white outline-none focus:border-rose-500"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-400">
                Upload Project Image (max 5 MiB)
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  try {
                    const url = await uploadFile(file, true);
                    setImage(url);
                  } catch (err: any) {
                    showNotification(err.message || "Upload failed", "error");
                  } finally {
                    e.target.value = "";
                  }
                }}
                className="w-full rounded-xl border border-slate-800 bg-slate-900 px-3.5 py-2.5 text-sm text-white outline-none focus:border-rose-500 file:mr-4 file:rounded-full file:border-0 file:bg-rose-600 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-rose-500"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="mb-1 block text-xs font-medium text-slate-400">
                Project Description *
              </label>
              <textarea
                rows={2}
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Brief summary of solution deployed and client impact..."
                className="w-full rounded-xl border border-slate-800 bg-slate-900 px-3.5 py-2.5 text-sm text-white outline-none focus:border-rose-500"
              />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="rounded-xl border border-slate-700 px-4 py-2 text-xs font-bold text-slate-300 hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-xl bg-rose-600 px-5 py-2 text-xs font-bold text-white hover:bg-rose-500"
            >
              Save Project
            </button>
          </div>
        </form>
      )}

      {/* Projects Grid */}
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {loading ? (
          <p className="text-slate-500 text-sm">Loading projects...</p>
        ) : projects.length === 0 ? (
          <p className="text-slate-500 text-sm">No projects found.</p>
        ) : (
          projects.map((proj) => (
            <div
              key={proj.id}
              className="flex flex-col justify-between rounded-2xl border border-slate-800 bg-slate-950 p-4"
            >
              <div>
                <div
                  className="mb-3 h-36 w-full rounded-xl bg-cover bg-center"
                  style={{ backgroundImage: `url('${proj.image || "/images/projects/project1.png"}')` }}
                />
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-400">
                  {proj.subtitle || "Enterprise Client"}
                </span>
                <h4 className="font-bold text-white text-base mt-0.5">{proj.title}</h4>
                <p className="mt-1 line-clamp-2 text-xs text-slate-400">
                  {proj.description || "No description"}
                </p>
              </div>

              <div className="mt-4 flex justify-end border-t border-slate-900 pt-3">
                <button
                  type="button"
                  onClick={() => handleDelete(proj.id)}
                  className="rounded-lg bg-red-950/60 border border-red-800/60 px-3 py-1 text-xs font-semibold text-red-400 hover:bg-red-900"
                >
                  Remove Project
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

// ----------------------------------------------------
// 8. Team Members Manager
// ----------------------------------------------------
function TeamManager({
  showNotification,
  onRefresh,
}: {
  showNotification: (msg: string, type?: "success" | "error") => void;
  onRefresh: () => void;
}) {
  const [members, setMembers] = useState<ContentItemRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);

  // Form State
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [bio, setBio] = useState("");
  const [image, setImage] = useState("/images/team/team1.png");

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/content?type=team&fallback=false");
      const data = await res.json();
      setMembers(Array.isArray(data) ? data : []);
    } catch {
      setMembers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleAdd = async (e: FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content_type: "team",
          title: name,
          subtitle: role,
          description: bio,
          image,
        }),
      });
      if (!res.ok) throw new Error("Failed to add team member");
      showNotification("Team member added");
      setName("");
      setRole("");
      setBio("");
      setImage("/images/team/team1.png");
      setIsAdding(false);
      load();
      onRefresh();
    } catch (err: any) {
      showNotification(err.message || "Failed to add team member", "error");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Remove this team member?")) return;
    try {
      const res = await fetch(`/api/content?id=${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");
      showNotification("Team member removed");
      load();
      onRefresh();
    } catch (err: any) {
      showNotification(err.message || "Delete failed", "error");
    }
  };

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-black text-white">Team Members</h2>
          <p className="text-xs text-slate-400">
            Manage executive leadership and team staff profiles across the website.
          </p>
        </div>
        <button
          onClick={() => setIsAdding(!isAdding)}
          className="rounded-xl bg-violet-600 px-4 py-2.5 text-xs font-bold text-white shadow-lg shadow-violet-600/30 hover:bg-violet-500"
        >
          {isAdding ? "✕ Cancel" : "+ Add Team Member"}
        </button>
      </div>

      {isAdding && (
        <form
          onSubmit={handleAdd}
          className="mt-6 rounded-2xl border border-slate-800 bg-slate-950 p-6 space-y-4"
        >
          <h3 className="font-bold text-white">Add Team Member</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-400">
                Full Name *
              </label>
              <input
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Abel Samuel"
                className="w-full rounded-xl border border-slate-800 bg-slate-900 px-3.5 py-2.5 text-sm text-white outline-none focus:border-violet-500"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-400">
                Role / Job Title *
              </label>
              <input
                required
                value={role}
                onChange={(e) => setRole(e.target.value)}
                placeholder="e.g. General Manager"
                className="w-full rounded-xl border border-slate-800 bg-slate-900 px-3.5 py-2.5 text-sm text-white outline-none focus:border-violet-500"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-400">
                Profile Photo Path / URL
              </label>
              <input
                value={image}
                onChange={(e) => setImage(e.target.value)}
                placeholder="/images/team/team1.png"
                className="w-full rounded-xl border border-slate-800 bg-slate-900 px-3.5 py-2.5 text-sm text-white outline-none focus:border-violet-500"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-400">
                Upload Profile Photo (max 5 MiB)
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  try {
                    const url = await uploadFile(file, true);
                    setImage(url);
                  } catch (err: any) {
                    showNotification(err.message || "Upload failed", "error");
                  } finally {
                    e.target.value = "";
                  }
                }}
                className="w-full rounded-xl border border-slate-800 bg-slate-900 px-3.5 py-2.5 text-sm text-white outline-none focus:border-violet-500 file:mr-4 file:rounded-full file:border-0 file:bg-violet-600 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-violet-500"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-400">
                Bio / Background
              </label>
              <input
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Brief professional background"
                className="w-full rounded-xl border border-slate-800 bg-slate-900 px-3.5 py-2.5 text-sm text-white outline-none focus:border-violet-500"
              />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="rounded-xl border border-slate-700 px-4 py-2 text-xs font-bold text-slate-300 hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-xl bg-violet-600 px-5 py-2 text-xs font-bold text-white hover:bg-violet-500"
            >
              Save Member
            </button>
          </div>
        </form>
      )}

      {/* Team Grid */}
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {loading ? (
          <p className="text-slate-500 text-sm">Loading team...</p>
        ) : members.length === 0 ? (
          <p className="text-slate-500 text-sm">No team members found.</p>
        ) : (
          members.map((m) => (
            <div
              key={m.id}
              className="flex flex-col items-center justify-between rounded-2xl border border-slate-800 bg-slate-950 p-4 text-center"
            >
              <div>
                <div className="mx-auto mb-3 h-28 w-28 overflow-hidden rounded-full bg-slate-900">
                  <img
                    src={m.image || "/images/team/team1.png"}
                    alt={m.title}
                    className="h-full w-full object-cover"
                  />
                </div>
                <h4 className="font-bold text-white text-base">{m.title}</h4>
                <p className="text-xs text-violet-400 font-medium">{m.subtitle}</p>
                <p className="mt-2 text-[11px] text-slate-400 line-clamp-2">
                  {m.description || ""}
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleDelete(m.id)}
                className="mt-4 text-xs font-semibold text-red-400 hover:text-red-300"
              >
                Remove Member
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

// ----------------------------------------------------
// 9. Contact Messages & Reply Center (with CAPTCHA status)
// ----------------------------------------------------
function MessagesManager({
  showNotification,
  onRefresh,
}: {
  showNotification: (msg: string, type?: "success" | "error") => void;
  onRefresh: () => void;
}) {
  const [messages, setMessages] = useState<ContactMessageRecord[]>([]);
  const [filter, setFilter] = useState<"all" | "new" | "in_progress" | "resolved">("all");
  const [loading, setLoading] = useState(true);
  const [selectedMessage, setSelectedMessage] = useState<ContactMessageRecord | null>(null);
  const [replyText, setReplyText] = useState("");
  const [replyStatus, setReplyStatus] = useState<"in_progress" | "resolved">("resolved");

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/contact");
      const data = await res.json();
      setMessages(Array.isArray(data) ? data : []);
    } catch {
      setMessages([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleUpdateStatus = async (id: number, status: string) => {
    try {
      const res = await fetch("/api/contact", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      });
      if (!res.ok) throw new Error("Status update failed");
      showNotification(`Status updated to ${status}`);
      load();
      onRefresh();
    } catch (err: any) {
      showNotification(err.message || "Failed to update status", "error");
    }
  };

  const handleSendReply = async (e: FormEvent) => {
    e.preventDefault();
    if (!selectedMessage) return;

    try {
      const res = await fetch("/api/contact", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: selectedMessage.id,
          status: replyStatus,
          admin_reply: replyText,
        }),
      });

      if (!res.ok) throw new Error("Reply saving failed");

      // Open email client with pre-filled response
      const mailtoUrl = `mailto:${selectedMessage.email}?subject=Re: ${encodeURIComponent(
        selectedMessage.subject
      )}&body=${encodeURIComponent(replyText)}`;
      window.open(mailtoUrl, "_blank");

      showNotification("Response saved and email client opened");
      setSelectedMessage(null);
      setReplyText("");
      load();
      onRefresh();
    } catch (err: any) {
      showNotification(err.message || "Failed to send reply", "error");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this contact message?")) return;
    try {
      const res = await fetch(`/api/contact?id=${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");
      showNotification("Message deleted");
      if (selectedMessage?.id === id) setSelectedMessage(null);
      load();
      onRefresh();
    } catch (err: any) {
      showNotification(err.message || "Delete failed", "error");
    }
  };

  const filteredMessages = messages.filter((m) =>
    filter === "all" ? true : m.status === filter
  );

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-black text-white">Contact Messages & Inquiries</h2>
          <p className="text-xs text-slate-400">
            View customer messages verified by HMAC CAPTCHA, submit official responses, and manage status.
          </p>
        </div>

        {/* Filter Buttons */}
        <div className="flex flex-wrap gap-2">
          {(["all", "new", "in_progress", "resolved"] as const).map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`rounded-lg px-3 py-1.5 text-xs font-bold capitalize transition ${
                filter === s
                  ? "bg-blue-600 text-white"
                  : "bg-slate-800 text-slate-300 hover:bg-slate-700"
              }`}
            >
              {s.replace("_", " ")}
            </button>
          ))}
        </div>
      </div>  

      {/* Security & CAPTCHA badge */}
      <div className="mt-4 flex items-center gap-3 rounded-xl border border-slate-800 bg-slate-950/70 p-3.5 text-xs text-slate-300">
        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-400 font-bold">
          🛡️
        </span>
        <div>
          <span className="font-bold text-white">CAPTCHA Security Active:</span> All incoming
          contact messages require cryptographic mathematical HMAC token verification to prevent spam bots.
        </div>
      </div>

      {/* Main Messages & Reply Area */}
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        {/* Messages List */}
        <div className="space-y-3">
          {loading ? (
            <p className="text-slate-500 text-sm">Loading messages...</p>
          ) : filteredMessages.length === 0 ? (
            <p className="text-slate-500 text-sm">No messages match filter.</p>
          ) : (
            filteredMessages.map((m) => (
              <div
                key={m.id}
                onClick={() => {
                  setSelectedMessage(m);
                  setReplyText(m.admin_reply || "");
                }}
                className={`cursor-pointer rounded-2xl border p-4 transition ${
                  selectedMessage?.id === m.id
                    ? "border-blue-500 bg-blue-950/20"
                    : "border-slate-800 bg-slate-950 hover:border-slate-700"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white text-sm">{m.name}</span>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${
                      m.status === "new"
                        ? "bg-emerald-500/20 text-emerald-400"
                        : m.status === "in_progress"
                        ? "bg-amber-500/20 text-amber-400"
                        : "bg-slate-700 text-slate-300"
                    }`}
                  >
                    {m.status.replace("_", " ")}
                  </span>
                </div>
                <p className="text-xs text-blue-400 mt-0.5">{m.email} {m.phone ? `· ${m.phone}` : ""}</p>
                <h5 className="mt-2 text-sm font-semibold text-slate-200">{m.subject}</h5>
                <p className="mt-1 line-clamp-2 text-xs text-slate-400">{m.message}</p>
                {m.admin_reply && (
                  <div className="mt-2 rounded-lg bg-slate-900 p-2 text-[11px] text-emerald-300 border border-emerald-900/40">
                    <span className="font-bold">✓ Replied:</span> {m.admin_reply}
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Selected Message Detail & Reply Box */}
        <div>
          {selectedMessage ? (
            <div className="rounded-2xl border border-slate-800 bg-slate-950 p-6 space-y-5">
              <div className="flex items-center justify-between border-b border-slate-900 pb-4">
                <div>
                  <h3 className="font-bold text-white text-lg">{selectedMessage.subject}</h3>
                  <p className="text-xs text-slate-400">
                    From: <strong className="text-white">{selectedMessage.name}</strong> ({selectedMessage.email})
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleDelete(selectedMessage.id)}
                  className="rounded-lg bg-red-950/60 border border-red-800/60 px-3 py-1.5 text-xs font-semibold text-red-400 hover:bg-red-900"
                >
                  Delete
                </button>
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Message Content
                </label>
                <div className="mt-2 rounded-xl bg-slate-900 p-4 text-sm text-slate-200 whitespace-pre-wrap">
                  {selectedMessage.message}
                </div>
              </div>

              <div className="flex items-center gap-3">
                <label className="text-xs font-medium text-slate-400">Status:</label>
                <select
                  value={selectedMessage.status}
                  onChange={(e) => handleUpdateStatus(selectedMessage.id, e.target.value)}
                  className="rounded-lg border border-slate-800 bg-slate-900 px-3 py-1 text-xs text-white"
                >
                  <option value="new">New</option>
                  <option value="in_progress">In Progress</option>
                  <option value="resolved">Resolved</option>
                </select>
              </div>

              {/* Reply Form */}
              <form onSubmit={handleSendReply} className="border-t border-slate-900 pt-4 space-y-3">
                <h4 className="font-bold text-white text-sm">Respond to {selectedMessage.name}</h4>
                <textarea
                  rows={4}
                  required
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder={`Dear ${selectedMessage.name},\n\nThank you for reaching out to SysNet Technologies...`}
                  className="w-full rounded-xl border border-slate-800 bg-slate-900 p-3 text-sm text-white outline-none focus:border-blue-500"
                />

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <label className="text-xs text-slate-400">Mark as:</label>
                    <select
                      value={replyStatus}
                      onChange={(e) => setReplyStatus(e.target.value as any)}
                      className="rounded-lg border border-slate-800 bg-slate-900 px-2 py-1 text-xs text-white"
                    >
                      <option value="resolved">Resolved</option>
                      <option value="in_progress">In Progress</option>
                    </select>
                  </div>

                  <button
                    type="submit"
                    className="rounded-xl bg-blue-600 px-5 py-2 text-xs font-bold text-white shadow-lg shadow-blue-600/30 hover:bg-blue-500"
                  >
                    Send Response & Email →
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <div className="flex h-64 items-center justify-center rounded-2xl border border-dashed border-slate-800 bg-slate-950/40 text-center text-slate-500">
              <p className="text-sm">Select a message from the list to view details and respond.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ----------------------------------------------------
// 10. Orders Manager
// ----------------------------------------------------
function OrdersManager({
  showNotification,
  onRefresh,
}: {
  showNotification: (msg: string, type?: "success" | "error") => void;
  onRefresh: () => void;
}) {
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/orders");
      const data = await res.json();
      setOrders(Array.isArray(data) ? data : []);
    } catch {
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleUpdateStatus = async (id: number, status: string) => {
    try {
      const res = await fetch("/api/orders", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      });
      if (!res.ok) throw new Error("Order update failed");
      showNotification(`Order status updated to ${status}`);
      load();
      onRefresh();
    } catch (err: any) {
      showNotification(err.message || "Failed to update order", "error");
    }
  };

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-black text-white">Cart Orders & Quotation Requests</h2>
          <p className="text-xs text-slate-400">
            Orders submitted by registered users through the online shop cart.
          </p>
        </div>
      </div>

      <div className="mt-6 space-y-4">
        {loading ? (
          <p className="text-slate-500 text-sm">Loading orders...</p>
        ) : orders.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-800 p-8 text-center text-slate-500">
            No customer orders placed yet.
          </div>
        ) : (
          orders.map((ord) => (
            <div
              key={ord.id}
              className="rounded-2xl border border-slate-800 bg-slate-950 p-5 space-y-4"
            >
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b border-slate-900 pb-3">
                <div>
                  <span className="text-xs font-bold text-blue-400">Order #{ord.id}</span>
                  <h4 className="font-bold text-white">{ord.user_name || ord.user_email}</h4>
                  <p className="text-xs text-slate-400">{ord.user_email} {ord.user_phone ? `· ${ord.user_phone}` : ""}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-base font-black text-emerald-400">
                    {Number(ord.total_amount).toFixed(2)} Birr
                  </span>
                  <select
                    value={ord.status}
                    onChange={(e) => handleUpdateStatus(ord.id, e.target.value)}
                    className="rounded-lg border border-slate-800 bg-slate-900 px-3 py-1.5 text-xs text-white font-medium"
                  >
                    <option value="pending">Pending</option>
                    <option value="processing">Processing</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </div>

              {/* Items List */}
              <div className="space-y-1">
                <div className="text-xs font-bold text-slate-400">Ordered Items:</div>
                <div className="grid gap-2 sm:grid-cols-2">
                  {Array.isArray(ord.items) &&
                    ord.items.map((item, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between rounded-lg bg-slate-900 px-3 py-2 text-xs text-slate-200"
                      >
                        <span>
                          {item.name} <strong className="text-slate-400">x{item.quantity}</strong>
                        </span>
                        <span className="font-bold text-slate-300">
                          {(item.price * item.quantity).toFixed(2)} Birr
                        </span>
                      </div>
                    ))}
                </div>
              </div>

              {ord.notes && (
                <p className="text-xs text-slate-400 italic">
                  Note: {ord.notes}
                </p>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
