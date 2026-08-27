"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "../../lib/supabase/client";
import { useCart } from "../components/CartProvider";

interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  role: string;
  phone?: string;
  created_at?: string;
}

interface UserOrder {
  id: number;
  items: Array<{ id: number; name: string; price: number; quantity: number }>;
  total_amount: number;
  status: "pending" | "processing" | "completed" | "cancelled";
  notes?: string;
  created_at: string;
}

interface UserInquiry {
  id: number;
  subject: string;
  message: string;
  status: "new" | "in_progress" | "resolved";
  admin_reply?: string;
  replied_at?: string;
  created_at: string;
}

export default function UserPortalPage() {
  const router = useRouter();
  const { items, total, removeFromCart, updateQuantity } = useCart();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"cart" | "orders" | "inquiries" | "profile">("cart");
  const [orders, setOrders] = useState<UserOrder[]>([]);
  const [inquiries, setInquiries] = useState<UserInquiry[]>([]);
  const [notice, setNotice] = useState<{ text: string; type: "success" | "error" } | null>(null);

  // Checkout modal / state
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [checkoutPhone, setCheckoutPhone] = useState("");
  const [checkoutNotes, setCheckoutNotes] = useState("");
  const [submittingOrder, setSubmittingOrder] = useState(false);

  // Profile Edit State
  const [editName, setEditName] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  const showNotification = (text: string, type: "success" | "error" = "success") => {
    setNotice({ text, type });
    setTimeout(() => setNotice(null), 4000);
  };

  useEffect(() => {
    async function initUser() {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();

      if (!session?.user) {
        // Fallback for demonstration / local testing if session is demo
        const localUser = window.localStorage.getItem("sysnet-user-demo");
        if (localUser) {
          const parsed = JSON.parse(localUser);
          setUser(parsed);
          setEditName(parsed.full_name || "");
          setEditPhone(parsed.phone || "");
          loadData(parsed.email);
          setLoading(false);
          return;
        }

        router.push("/login");
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", session.user.id)
        .maybeSingle();

      const userData: UserProfile = {
        id: session.user.id,
        email: session.user.email || "",
        full_name: profile?.full_name || session.user.user_metadata?.full_name || "Valued Member",
        role: profile?.role || "user",
        phone: profile?.phone || "",
        created_at: session.user.created_at,
      };

      setUser(userData);
      setEditName(userData.full_name);
      setEditPhone(userData.phone || "");
      loadData(userData.email);
      setLoading(false);
    }

    initUser();
  }, [router]);

  const loadData = async (email: string) => {
    try {
      const [orderRes, inqRes] = await Promise.all([
        fetch(`/api/orders?email=${encodeURIComponent(email)}`).then((r) => r.json()).catch(() => []),
        fetch(`/api/contact?email=${encodeURIComponent(email)}`).then((r) => r.json()).catch(() => []),
      ]);

      setOrders(Array.isArray(orderRes) ? orderRes : []);
      setInquiries(Array.isArray(inqRes) ? inqRes : []);
    } catch {
      // ignore
    }
  };

  const handleSignOut = async () => {
    window.localStorage.removeItem("sysnet-user-demo");
    await createClient().auth.signOut();
    router.push("/login");
  };

  const handleUpdateProfile = async (e: FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setIsSavingProfile(true);

    try {
      const supabase = createClient();
      await supabase.from("profiles").update({ full_name: editName, phone: editPhone }).eq("id", user.id);
      setUser((prev) => (prev ? { ...prev, full_name: editName, phone: editPhone } : null));
      showNotification("Profile updated successfully!");
    } catch {
      showNotification("Profile updated locally.");
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handlePlaceOrder = async (e: FormEvent) => {
    e.preventDefault();
    if (!user || items.length === 0) return;
    setSubmittingOrder(true);

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_email: user.email,
          user_name: user.full_name,
          user_phone: checkoutPhone || user.phone,
          items: items.map((i) => ({ id: i.id, name: i.name, price: i.price, quantity: i.quantity })),
          total_amount: total,
          notes: checkoutNotes,
        }),
      });

      if (!res.ok) throw new Error("Could not submit order");

      const newOrder = await res.json();
      setOrders((prev) => [newOrder, ...prev]);
      showNotification("Order / Quotation inquiry submitted successfully!");
      setIsCheckingOut(false);
      setCheckoutNotes("");
      setActiveTab("orders");

      // clear cart
      window.localStorage.removeItem("sysnet-cart");
      window.location.reload();
    } catch (err: any) {
      showNotification(err.message || "Failed to place order", "error");
    } finally {
      setSubmittingOrder(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-r-transparent"></div>
          <p className="mt-3 text-sm font-semibold text-slate-600">Loading your portal...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-10">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        {/* Floating notification */}
        {notice && (
          <div
            className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-xl px-5 py-3.5 shadow-2xl transition-all ${
              notice.type === "success" ? "bg-emerald-600 text-white" : "bg-red-600 text-white"
            }`}
          >
            <span>{notice.type === "success" ? "✓" : "⚠"}</span>
            <p className="text-sm font-semibold">{notice.text}</p>
          </div>
        )}

        {/* User Portal Header */}
        <div className="overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 p-6 sm:p-8 text-white shadow-xl">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-600 text-2xl font-black text-white shadow-lg shadow-blue-500/30">
                {user?.full_name?.charAt(0).toUpperCase() || "U"}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-black tracking-tight sm:text-3xl">
                    {user?.full_name}
                  </h1>
                  <span className="rounded-full bg-blue-500/20 px-2.5 py-0.5 text-xs font-bold text-blue-300">
                    {user?.role === "admin" ? "Administrator" : "Member"}
                  </span>
                </div>
                <p className="text-xs text-slate-300 sm:text-sm">{user?.email}</p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {user?.role === "admin" && (
                <Link
                  href="/admin"
                  className="rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white shadow-md hover:bg-blue-500"
                >
                  Admin Workspace ⚙️
                </Link>
              )}
              <Link
                href="/shop"
                className="rounded-xl border border-slate-700 bg-slate-800/80 px-4 py-2 text-xs font-bold text-slate-200 hover:bg-slate-700"
              >
                Browse Shop 🛍️
              </Link>
              <button
                type="button"
                onClick={handleSignOut}
                className="rounded-xl bg-red-600/80 px-4 py-2 text-xs font-bold text-white hover:bg-red-700"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="mt-8 flex gap-2 border-b border-slate-200 pb-2">
          <button
            onClick={() => setActiveTab("cart")}
            className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold transition ${
              activeTab === "cart"
                ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                : "text-slate-600 hover:bg-slate-200"
            }`}
          >
            <span>🛒</span> My Cart ({items.reduce((s, i) => s + i.quantity, 0)})
          </button>
          <button
            onClick={() => setActiveTab("orders")}
            className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold transition ${
              activeTab === "orders"
                ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                : "text-slate-600 hover:bg-slate-200"
            }`}
          >
            <span>📦</span> Order Inquiries ({orders.length})
          </button>
          <button
            onClick={() => setActiveTab("inquiries")}
            className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold transition ${
              activeTab === "inquiries"
                ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                : "text-slate-600 hover:bg-slate-200"
            }`}
          >
            <span>💬</span> My Messages ({inquiries.length})
          </button>
          <button
            onClick={() => setActiveTab("profile")}
            className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold transition ${
              activeTab === "profile"
                ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                : "text-slate-600 hover:bg-slate-200"
            }`}
          >
            <span>👤</span> Profile Settings
          </button>
        </div>

        {/* Tab 1: Cart */}
        {activeTab === "cart" && (
          <div className="mt-6">
            {items.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-12 text-center shadow-sm">
                <div className="text-4xl">🛒</div>
                <h3 className="mt-3 text-lg font-bold text-slate-900">Your cart is empty</h3>
                <p className="mt-1 text-sm text-slate-500">
                  Explore our shop and add networking or computing products to request an inquiry.
                </p>
                <Link
                  href="/shop"
                  className="mt-6 inline-flex rounded-xl bg-blue-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-blue-500/30 hover:bg-blue-500"
                >
                  Go to Shop Catalog
                </Link>
              </div>
            ) : (
              <div className="grid gap-8 lg:grid-cols-3">
                {/* Cart Items */}
                <div className="space-y-4 lg:col-span-2">
                  {items.map((item) => (
                    <div
                      key={item.id}
                      className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div className="flex items-center gap-4">
                        <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-slate-100">
                          <img
                            src={item.image || "/products/product1.jpg"}
                            alt={item.name}
                            className="h-full w-full object-cover"
                          />
                        </div>
                        <div>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600">
                            {item.category}
                          </span>
                          <h4 className="font-bold text-slate-900 text-base">{item.name}</h4>
                          <p className="text-xs text-slate-500">${item.price.toFixed(2)} each</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 self-end sm:self-center">
                        <div className="flex items-center rounded-lg border border-slate-200 bg-slate-50">
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="px-2.5 py-1 text-slate-600 hover:bg-slate-200"
                          >
                            -
                          </button>
                          <span className="w-8 text-center text-xs font-bold text-slate-800">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="px-2.5 py-1 text-slate-600 hover:bg-slate-200"
                          >
                            +
                          </button>
                        </div>

                        <strong className="min-w-20 text-right text-base font-black text-slate-900">
                          ${(item.price * item.quantity).toFixed(2)}
                        </strong>

                        <button
                          type="button"
                          onClick={() => removeFromCart(item.id)}
                          className="text-xs font-bold text-red-500 hover:text-red-700"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Cart Summary Card */}
                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm h-fit space-y-4">
                  <h3 className="font-bold text-slate-900 text-lg">Order Summary</h3>
                  <div className="space-y-2 text-sm text-slate-600 border-b border-slate-100 pb-4">
                    <div className="flex justify-between">
                      <span>Total Items:</span>
                      <strong className="text-slate-900">
                        {items.reduce((s, i) => s + i.quantity, 0)}
                      </strong>
                    </div>
                    <div className="flex justify-between">
                      <span>Estimated Subtotal:</span>
                      <strong className="text-slate-900">${total.toFixed(2)}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span>Tax / Handling:</span>
                      <span className="text-emerald-600 font-semibold">Included</span>
                    </div>
                  </div>

                  <div className="flex justify-between items-center text-lg font-black text-slate-900">
                    <span>Total:</span>
                    <span className="text-2xl text-blue-600">${total.toFixed(2)}</span>
                  </div>

                  <button
                    type="button"
                    onClick={() => setIsCheckingOut(true)}
                    className="w-full rounded-xl bg-blue-600 py-3.5 text-center text-sm font-bold text-white shadow-lg shadow-blue-500/30 transition hover:bg-blue-700"
                  >
                    Submit Quotation / Order →
                  </button>
                </div>
              </div>
            )}

            {/* Checkout Modal */}
            {isCheckingOut && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
                <div className="w-full max-w-lg rounded-3xl bg-white p-6 sm:p-8 shadow-2xl">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                    <h3 className="text-xl font-bold text-slate-900">Confirm Order Request</h3>
                    <button
                      type="button"
                      onClick={() => setIsCheckingOut(false)}
                      className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                    >
                      ✕
                    </button>
                  </div>

                  <form onSubmit={handlePlaceOrder} className="mt-4 space-y-4">
                    <div>
                      <label className="block text-xs font-medium text-slate-700">Full Name</label>
                      <input
                        disabled
                        value={user?.full_name}
                        className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-600"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-700">Email</label>
                      <input
                        disabled
                        value={user?.email}
                        className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-600"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-700">
                        Contact Phone Number
                      </label>
                      <input
                        value={checkoutPhone}
                        onChange={(e) => setCheckoutPhone(e.target.value)}
                        placeholder="+251 911 000 000"
                        className="mt-1 w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm text-slate-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-700">
                        Delivery Notes or Special Instructions
                      </label>
                      <textarea
                        rows={3}
                        value={checkoutNotes}
                        onChange={(e) => setCheckoutNotes(e.target.value)}
                        placeholder="e.g. Please include installation quote with the hardware..."
                        className="mt-1 w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm text-slate-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                      />
                    </div>

                    <div className="rounded-xl bg-blue-50 p-4 text-xs text-blue-800">
                      <strong>Order Total: ${total.toFixed(2)}</strong>. SysNet specialists will review your order inquiry and contact you with confirmation and delivery logistics.
                    </div>

                    <div className="flex justify-end gap-3 pt-2">
                      <button
                        type="button"
                        onClick={() => setIsCheckingOut(false)}
                        className="rounded-xl border border-slate-200 px-5 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-50"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={submittingOrder}
                        className="rounded-xl bg-blue-600 px-6 py-2.5 text-xs font-bold text-white shadow-lg shadow-blue-500/30 hover:bg-blue-700 disabled:opacity-50"
                      >
                        {submittingOrder ? "Submitting..." : "Confirm & Send"}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Orders History */}
        {activeTab === "orders" && (
          <div className="mt-6 space-y-4">
            {orders.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-12 text-center text-slate-500">
                You have not submitted any order requests yet.
              </div>
            ) : (
              orders.map((ord) => (
                <div
                  key={ord.id}
                  className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4"
                >
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-3">
                    <div>
                      <span className="text-xs font-bold text-blue-600">Order ID: #{ord.id}</span>
                      <h4 className="font-bold text-slate-900 text-base">
                        Total Amount: ${Number(ord.total_amount).toFixed(2)}
                      </h4>
                    </div>
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-bold capitalize ${
                        ord.status === "completed"
                          ? "bg-emerald-100 text-emerald-800"
                          : ord.status === "processing"
                          ? "bg-blue-100 text-blue-800"
                          : ord.status === "cancelled"
                          ? "bg-red-100 text-red-800"
                          : "bg-amber-100 text-amber-800"
                      }`}
                    >
                      Status: {ord.status}
                    </span>
                  </div>

                  <div className="grid gap-2 sm:grid-cols-2">
                    {Array.isArray(ord.items) &&
                      ord.items.map((item, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between rounded-xl bg-slate-50 p-3 text-xs text-slate-700"
                        >
                          <span className="font-medium">
                            {item.name} <strong className="text-slate-500">x{item.quantity}</strong>
                          </span>
                          <span className="font-bold text-slate-900">
                            ${(item.price * item.quantity).toFixed(2)}
                          </span>
                        </div>
                      ))}
                  </div>

                  {ord.notes && (
                    <p className="text-xs text-slate-500 italic">
                      Special Notes: {ord.notes}
                    </p>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {/* Tab 3: Contact Inquiries & Admin Replies */}
        {activeTab === "inquiries" && (
          <div className="mt-6 space-y-4">
            {inquiries.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-12 text-center text-slate-500">
                <p>You have not submitted any contact inquiries from this email yet.</p>
                <Link
                  href="/contact"
                  className="mt-4 inline-block font-bold text-blue-600 hover:underline text-sm"
                >
                  Submit a Message via Contact Page →
                </Link>
              </div>
            ) : (
              inquiries.map((inq) => (
                <div
                  key={inq.id}
                  className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-3">
                    <h4 className="font-bold text-slate-900 text-base">{inq.subject}</h4>
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-bold uppercase ${
                        inq.status === "resolved"
                          ? "bg-emerald-100 text-emerald-800"
                          : inq.status === "in_progress"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-amber-100 text-amber-800"
                      }`}
                    >
                      {inq.status.replace("_", " ")}
                    </span>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      Your Message
                    </label>
                    <p className="mt-1 text-sm text-slate-700 whitespace-pre-wrap">{inq.message}</p>
                  </div>

                  {inq.admin_reply ? (
                    <div className="mt-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4">
                      <div className="flex items-center gap-2 text-xs font-bold text-emerald-800">
                        <span>💬</span> SysNet Administrator Response:
                      </div>
                      <p className="mt-2 text-sm text-emerald-950 whitespace-pre-wrap">
                        {inq.admin_reply}
                      </p>
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400 italic">
                      Pending administrator review...
                    </p>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {/* Tab 4: Profile Settings */}
        {activeTab === "profile" && (
          <div className="mt-6 max-w-xl rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm">
            <h3 className="text-xl font-bold text-slate-900">Personal Information</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Update your account details and contact preferences.
            </p>

            <form onSubmit={handleUpdateProfile} className="mt-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700">Full Name</label>
                <input
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm text-slate-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700">Email Address</label>
                <input
                  disabled
                  value={user?.email}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700">Phone Number</label>
                <input
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  placeholder="+251 911 000 000"
                  className="mt-1 w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm text-slate-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSavingProfile}
                  className="rounded-xl bg-blue-600 px-6 py-2.5 text-xs font-bold text-white shadow-md shadow-blue-500/30 hover:bg-blue-700 disabled:opacity-50"
                >
                  {isSavingProfile ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
