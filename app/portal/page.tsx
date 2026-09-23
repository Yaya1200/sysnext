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
  user_id?: string;
  items: Array<{
    id: number;
    name: string;
    price: number;
    quantity: number;
  }>;
  total_amount: number;
  status: "pending" | "processing" | "completed" | "cancelled";
  notes?: string;
  created_at: string;
}

interface UserInquiry {
  id: number;
  user_id?: string;
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

  const [activeTab, setActiveTab] = useState<
    "cart" | "orders" | "inquiries" | "profile"
  >("cart");

  const [orders, setOrders] = useState<UserOrder[]>([]);
  const [inquiries, setInquiries] = useState<UserInquiry[]>([]);

  const [notice, setNotice] = useState<{
    text: string;
    type: "success" | "error";
  } | null>(null);

  // Checkout
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [checkoutPhone, setCheckoutPhone] = useState("");
  const [checkoutNotes, setCheckoutNotes] = useState("");
  const [submittingOrder, setSubmittingOrder] = useState(false);

  // Profile
  const [editName, setEditName] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  const showNotification = (
    text: string,
    type: "success" | "error" = "success"
  ) => {
    setNotice({ text, type });

    setTimeout(() => {
      setNotice(null);
    }, 4000);
  };

  /*
   * Load orders and inquiries for the currently
   * authenticated Supabase user.
   *
   * IMPORTANT:
   * The API routes determine the user from the
   * authenticated Supabase session.
   *
   * We intentionally do NOT send user_id from
   * the browser because the browser should never
   * be trusted to choose whose data it can access.
   */
  const loadData = async () => {
    try {
      const [orderResponse, inquiryResponse] = await Promise.all([
        fetch("/api/orders", {
          cache: "no-store",
        }),

        fetch("/api/contact", {
          cache: "no-store",
        }),
      ]);

      if (!orderResponse.ok) {
        throw new Error("Failed to load orders");
      }

      if (!inquiryResponse.ok) {
        throw new Error("Failed to load inquiries");
      }

      const orderData = await orderResponse.json();
      const inquiryData = await inquiryResponse.json();

      setOrders(Array.isArray(orderData) ? orderData : []);
      setInquiries(Array.isArray(inquiryData) ? inquiryData : []);
    } catch (error) {
      console.error("Failed to load user data:", error);

      setOrders([]);
      setInquiries([]);
    }
  };

  /*
   * Get the authenticated Supabase user.
   *
   * There is NO localStorage demo-user fallback.
   */
  useEffect(() => {
    let mounted = true;

    async function initUser() {
      try {
        const supabase = createClient();

        const {
          data: { user: authUser },
          error: authError,
        } = await supabase.auth.getUser();

        if (authError || !authUser) {
          if (mounted) {
            setLoading(false);
            router.replace("/login");
          }

          return;
        }

        /*
         * Load this user's profile.
         *
         * IMPORTANT:
         * profiles.id must equal auth.users.id.
         *
         * Do NOT select email here.
         * The profiles table does not have an email column.
         *
         * Email comes from Supabase Auth:
         * authUser.email
         */
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("id, full_name, role, phone, created_at")
          .eq("id", authUser.id)
          .maybeSingle();

        if (profileError) {
          console.error("Profile loading error:", profileError);
        }

        if (!mounted) return;

        /*
         * Build the portal user from:
         *
         * 1. Supabase Auth identity
         * 2. profiles table for additional information
         */
        const userData: UserProfile = {
          id: authUser.id,

          // Email comes from Supabase Auth.
          email: authUser.email || "",

          full_name:
            profile?.full_name ||
            authUser.user_metadata?.full_name ||
            "Valued Member",

          role:
            profile?.role ||
            authUser.user_metadata?.role ||
            "user",

          phone: profile?.phone || "",

          created_at:
            profile?.created_at ||
            authUser.created_at,
        };

        setUser(userData);

        setEditName(userData.full_name);
        setEditPhone(userData.phone || "");
        setCheckoutPhone(userData.phone || "");

        /*
         * Load only the authenticated user's
         * orders and inquiries.
         *
         * The API determines ownership from
         * the Supabase Auth session.
         */
        await loadData();

        if (mounted) {
          setLoading(false);
        }
      } catch (error) {
        console.error("Portal initialization error:", error);

        if (mounted) {
          setLoading(false);
          router.replace("/login");
        }
      }
    }

    initUser();

    return () => {
      mounted = false;
    };
  }, [router]);

  /*
   * Sign out the actual Supabase account.
   */
  const handleSignOut = async () => {
    try {
      const supabase = createClient();

      await supabase.auth.signOut();

      router.replace("/login");
      router.refresh();
    } catch (error) {
      console.error("Sign out error:", error);
    }
  };

  /*
   * Update profile.
   */
  const handleUpdateProfile = async (e: FormEvent) => {
    e.preventDefault();

    if (!user) return;

    const cleanName = editName.trim();
    const cleanPhone = editPhone.trim();

    if (!cleanName) {
      showNotification("Full name is required.", "error");
      return;
    }

    setIsSavingProfile(true);

    try {
      const supabase = createClient();

      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: cleanName,
          phone: cleanPhone,
        })
        .eq("id", user.id);

      if (error) {
        throw error;
      }

      setUser((previous) =>
        previous
          ? {
              ...previous,
              full_name: cleanName,
              phone: cleanPhone,
            }
          : null
      );

      setCheckoutPhone(cleanPhone);

      showNotification("Profile updated successfully.");
    } catch (error) {
      console.error("Profile update error:", error);

      showNotification(
        "Could not update your profile.",
        "error"
      );
    } finally {
      setIsSavingProfile(false);
    }
  };

  /*
   * Submit an order.
   *
   * IMPORTANT:
   * The API should derive the actual user ID
   * from Supabase Auth.
   *
   * We still send user information for the order
   * payload, but the server must NOT trust user_id
   * or user_email from the browser.
   */
  const handlePlaceOrder = async (e: FormEvent) => {
    e.preventDefault();

    if (!user) {
      showNotification(
        "You must be logged in to place an order.",
        "error"
      );
      return;
    }

    if (items.length === 0) {
      showNotification(
        "Your cart is empty.",
        "error"
      );
      return;
    }

    setSubmittingOrder(true);

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          user_id: user.id,
          user_email: user.email,
          user_name: user.full_name,
          user_phone:
            checkoutPhone ||
            user.phone ||
            "",

          items: items.map((item) => ({
            id: item.id,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
          })),

          total_amount: total,
          notes: checkoutNotes.trim(),
        }),
      });

      const responseData = await res.json().catch(() => null);

      if (!res.ok) {
        throw new Error(
          responseData?.error ||
            "Could not submit order."
        );
      }

      const newOrder = responseData;

      setOrders((previous) => [
        newOrder,
        ...previous,
      ]);

      showNotification(
        "Order / quotation inquiry submitted successfully!"
      );

      setIsCheckingOut(false);
      setCheckoutNotes("");

      setActiveTab("orders");

      /*
       * Clear cart.
       */
      window.localStorage.removeItem("sysnet-cart");

      /*
       * Reload the cart provider state.
       */
      window.location.reload();
    } catch (error) {
      console.error("Place order error:", error);

      showNotification(
        error instanceof Error
          ? error.message
          : "Failed to place order.",
        "error"
      );
    } finally {
      setSubmittingOrder(false);
    }
  };

  /*
   * Loading screen.
   */
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-r-transparent" />

          <p className="mt-3 text-sm font-semibold text-slate-600">
            Loading your portal...
          </p>
        </div>
      </div>
    );
  }

  /*
   * No authenticated user.
   */
  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-50 py-10">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">

        {/* Notification */}
        {notice && (
          <div
            className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-xl px-5 py-3.5 shadow-2xl ${
              notice.type === "success"
                ? "bg-emerald-600 text-white"
                : "bg-red-600 text-white"
            }`}
          >
            <span>
              {notice.type === "success" ? "✓" : "⚠"}
            </span>

            <p className="text-sm font-semibold">
              {notice.text}
            </p>
          </div>
        )}

        {/* Header */}
        <div className="overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 p-6 text-white shadow-xl sm:p-8">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">

            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-600 text-2xl font-black text-white shadow-lg shadow-blue-500/30">
                {user.full_name
                  ?.charAt(0)
                  .toUpperCase() || "U"}
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-black tracking-tight sm:text-3xl">
                    {user.full_name}
                  </h1>

                  <span className="rounded-full bg-blue-500/20 px-2.5 py-0.5 text-xs font-bold text-blue-300">
                    {user.role === "admin"
                      ? "Administrator"
                      : "Member"}
                  </span>
                </div>

                <p className="text-xs text-slate-300 sm:text-sm">
                  {user.email}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">

              {user.role === "admin" && (
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

        {/* Tabs */}
        <div className="mt-8 flex flex-wrap gap-2 border-b border-slate-200 pb-2">

          <button
            type="button"
            onClick={() => setActiveTab("cart")}
            className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold transition ${
              activeTab === "cart"
                ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                : "text-slate-600 hover:bg-slate-200"
            }`}
          >
            🛒 My Cart (
            {items.reduce(
              (sum, item) => sum + item.quantity,
              0
            )}
            )
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("orders")}
            className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold transition ${
              activeTab === "orders"
                ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                : "text-slate-600 hover:bg-slate-200"
            }`}
          >
            📦 Order Inquiries ({orders.length})
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("inquiries")}
            className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold transition ${
              activeTab === "inquiries"
                ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                : "text-slate-600 hover:bg-slate-200"
            }`}
          >
            💬 My Messages ({inquiries.length})
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("profile")}
            className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold transition ${
              activeTab === "profile"
                ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                : "text-slate-600 hover:bg-slate-200"
            }`}
          >
            👤 Profile Settings
          </button>
        </div>

        {/* CART */}
        {activeTab === "cart" && (
          <div className="mt-6">

            {items.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-12 text-center shadow-sm">
                <div className="text-4xl">🛒</div>

                <h3 className="mt-3 text-lg font-bold text-slate-900">
                  Your cart is empty
                </h3>

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

                {/* Cart items */}
                <div className="space-y-4 lg:col-span-2">
                  {items.map((item) => (
                    <div
                      key={item.id}
                      className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div className="flex items-center gap-4">
                        <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-slate-100">
                          <img
                            src={
                              item.image ||
                              "/products/product1.jpg"
                            }
                            alt={item.name}
                            className="h-full w-full object-cover"
                          />
                        </div>

                        <div>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600">
                            {item.category}
                          </span>

                          <h4 className="text-base font-bold text-slate-900">
                            {item.name}
                          </h4>

                          <p className="text-xs text-slate-500">
                            {Math.round(
                              item.price * 155
                            ).toLocaleString()}{" "}
                            ETB each
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 self-end sm:self-center">

                        <div className="flex items-center rounded-lg border border-slate-200 bg-slate-50">
                          <button
                            type="button"
                            onClick={() =>
                              updateQuantity(
                                item.id,
                                item.quantity - 1
                              )
                            }
                            className="px-2.5 py-1 text-slate-600 hover:bg-slate-200"
                          >
                            -
                          </button>

                          <span className="w-8 text-center text-xs font-bold text-slate-800">
                            {item.quantity}
                          </span>

                          <button
                            type="button"
                            onClick={() =>
                              updateQuantity(
                                item.id,
                                item.quantity + 1
                              )
                            }
                            className="px-2.5 py-1 text-slate-600 hover:bg-slate-200"
                          >
                            +
                          </button>
                        </div>

                        <strong className="min-w-20 text-right text-base font-black text-slate-900">
                          {(
                            item.price *
                            item.quantity
                          ).toFixed(2)}{" "}
                          ETB
                        </strong>

                        <button
                          type="button"
                          onClick={() =>
                            removeFromCart(item.id)
                          }
                          className="text-xs font-bold text-red-500 hover:text-red-700"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Summary */}
                <div className="h-fit space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                  <h3 className="text-lg font-bold text-slate-900">
                    Order Summary
                  </h3>

                  <div className="space-y-2 border-b border-slate-100 pb-4 text-sm text-slate-600">

                    <div className="flex justify-between">
                      <span>Total Items:</span>

                      <strong className="text-slate-900">
                        {items.reduce(
                          (sum, item) =>
                            sum + item.quantity,
                          0
                        )}
                      </strong>
                    </div>

                    <div className="flex justify-between">
                      <span>Estimated Subtotal:</span>

                      <strong className="text-slate-900">
                        {total.toFixed(2)} ETB
                      </strong>
                    </div>

                    <div className="flex justify-between">
                      <span>Tax / Handling:</span>

                      <span className="font-semibold text-emerald-600">
                        Included
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-lg font-black text-slate-900">
                    <span>Total:</span>

                    <span className="text-2xl text-blue-600">
                      {total.toFixed(2)} ETB
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      setIsCheckingOut(true)
                    }
                    className="w-full rounded-xl bg-blue-600 py-3.5 text-center text-sm font-bold text-white shadow-lg shadow-blue-500/30 transition hover:bg-blue-700"
                  >
                    Submit Quotation / Order →
                  </button>
                </div>
              </div>
            )}

            {/* Checkout modal */}
            {isCheckingOut && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
                <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl sm:p-8">

                  <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                    <h3 className="text-xl font-bold text-slate-900">
                      Confirm Order Request
                    </h3>

                    <button
                      type="button"
                      onClick={() =>
                        setIsCheckingOut(false)
                      }
                      className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                    >
                      ✕
                    </button>
                  </div>

                  <form
                    onSubmit={handlePlaceOrder}
                    className="mt-4 space-y-4"
                  >
                    <div>
                      <label className="block text-xs font-medium text-slate-700">
                        Full Name
                      </label>

                      <input
                        disabled
                        value={user.full_name}
                        className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-600"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-700">
                        Email
                      </label>

                      <input
                        disabled
                        value={user.email}
                        className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-600"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-700">
                        Contact Phone Number
                      </label>

                      <input
                        value={checkoutPhone}
                        onChange={(e) =>
                          setCheckoutPhone(
                            e.target.value
                          )
                        }
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
                        onChange={(e) =>
                          setCheckoutNotes(
                            e.target.value
                          )
                        }
                        placeholder="e.g. Please include installation quote with the hardware..."
                        className="mt-1 w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm text-slate-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                      />
                    </div>

                    <div className="rounded-xl bg-blue-50 p-4 text-xs text-blue-800">
                      <strong>
                        Order Total:{" "}
                        {total.toFixed(2)} ETB
                      </strong>
                      . SysNet specialists will review your order inquiry and contact you with confirmation and delivery logistics.
                    </div>

                    <div className="flex justify-end gap-3 pt-2">
                      <button
                        type="button"
                        onClick={() =>
                          setIsCheckingOut(false)
                        }
                        className="rounded-xl border border-slate-200 px-5 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-50"
                      >
                        Cancel
                      </button>

                      <button
                        type="submit"
                        disabled={submittingOrder}
                        className="rounded-xl bg-blue-600 px-6 py-2.5 text-xs font-bold text-white shadow-lg shadow-blue-500/30 hover:bg-blue-700 disabled:opacity-50"
                      >
                        {submittingOrder
                          ? "Submitting..."
                          : "Confirm & Send"}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ORDERS */}
        {activeTab === "orders" && (
          <div className="mt-6 space-y-4">

            {orders.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-12 text-center text-slate-500">
                You have not submitted any order requests yet.
              </div>
            ) : (
              orders.map((order) => (
                <div
                  key={order.id}
                  className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
                >
                  <div className="flex flex-col gap-2 border-b border-slate-100 pb-3 sm:flex-row sm:items-center sm:justify-between">

                    <div>
                      <span className="text-xs font-bold text-blue-600">
                        Order ID: #{order.id}
                      </span>

                      <h4 className="text-base font-bold text-slate-900">
                        Total Amount:{" "}
                        {Number(
                          order.total_amount
                        ).toFixed(2)}{" "}
                        ETB
                      </h4>
                    </div>

                    <span
                      className={`rounded-full px-3 py-1 text-xs font-bold capitalize ${
                        order.status === "completed"
                          ? "bg-emerald-100 text-emerald-800"
                          : order.status === "processing"
                          ? "bg-blue-100 text-blue-800"
                          : order.status === "cancelled"
                          ? "bg-red-100 text-red-800"
                          : "bg-amber-100 text-amber-800"
                      }`}
                    >
                      Status: {order.status}
                    </span>
                  </div>

                  <div className="grid gap-2 sm:grid-cols-2">
                    {Array.isArray(order.items) &&
                      order.items.map(
                        (item, index) => (
                          <div
                            key={`${order.id}-${index}`}
                            className="flex items-center justify-between rounded-xl bg-slate-50 p-3 text-xs text-slate-700"
                          >
                            <span className="font-medium">
                              {item.name}{" "}
                              <strong className="text-slate-500">
                                x{item.quantity}
                              </strong>
                            </span>

                            <span className="font-bold text-slate-900">
                              {(
                                item.price *
                                item.quantity
                              ).toFixed(2)}{" "}
                              ETB
                            </span>
                          </div>
                        )
                      )}
                  </div>

                  {order.notes && (
                    <p className="text-xs italic text-slate-500">
                      Special Notes: {order.notes}
                    </p>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {/* INQUIRIES */}
        {activeTab === "inquiries" && (
          <div className="mt-6 space-y-4">

            {inquiries.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-12 text-center text-slate-500">

                <p>
                  You have not submitted any contact inquiries from this account yet.
                </p>

                <Link
                  href="/contact"
                  className="mt-4 inline-block text-sm font-bold text-blue-600 hover:underline"
                >
                  Submit a Message via Contact Page →
                </Link>
              </div>
            ) : (
              inquiries.map((inquiry) => (
                <div
                  key={inquiry.id}
                  className="space-y-3 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
                >
                  <div className="flex flex-col border-b border-slate-100 pb-3 sm:flex-row sm:items-center sm:justify-between">

                    <h4 className="text-base font-bold text-slate-900">
                      {inquiry.subject}
                    </h4>

                    <span
                      className={`rounded-full px-3 py-1 text-xs font-bold uppercase ${
                        inquiry.status === "resolved"
                          ? "bg-emerald-100 text-emerald-800"
                          : inquiry.status ===
                            "in_progress"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-amber-100 text-amber-800"
                      }`}
                    >
                      {inquiry.status.replace(
                        "_",
                        " "
                      )}
                    </span>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      Your Message
                    </label>

                    <p className="mt-1 whitespace-pre-wrap text-sm text-slate-700">
                      {inquiry.message}
                    </p>
                  </div>

                  {inquiry.admin_reply ? (
                    <div className="mt-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4">

                      <div className="flex items-center gap-2 text-xs font-bold text-emerald-800">
                        💬 SysNet Administrator Response:
                      </div>

                      <p className="mt-2 whitespace-pre-wrap text-sm text-emerald-950">
                        {inquiry.admin_reply}
                      </p>
                    </div>
                  ) : (
                    <p className="text-xs italic text-slate-400">
                      Pending administrator review...
                    </p>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {/* PROFILE */}
        {activeTab === "profile" && (
          <div className="mt-6 max-w-xl rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">

            <h3 className="text-xl font-bold text-slate-900">
              Personal Information
            </h3>

            <p className="mt-0.5 text-xs text-slate-500">
              Update your account details and contact preferences.
            </p>

            <form
              onSubmit={handleUpdateProfile}
              className="mt-6 space-y-4"
            >
              <div>
                <label className="block text-xs font-semibold text-slate-700">
                  Full Name
                </label>

                <input
                  required
                  value={editName}
                  onChange={(e) =>
                    setEditName(e.target.value)
                  }
                  className="mt-1 w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm text-slate-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700">
                  Email Address
                </label>

                <input
                  disabled
                  value={user.email}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700">
                  Phone Number
                </label>

                <input
                  value={editPhone}
                  onChange={(e) =>
                    setEditPhone(e.target.value)
                  }
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
                  {isSavingProfile
                    ? "Saving..."
                    : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}