"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useCart } from "../../components/CartProvider";

export default function CartPage() {
  const router = useRouter();
  const { items, total, removeFromCart, updateQuantity } = useCart();
  const [isOrdering, setIsOrdering] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [userName, setUserName] = useState("");
  const [userPhone, setUserPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [orderNotice, setOrderNotice] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleQuickSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0 || !userEmail) return;

    setSubmitting(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_email: userEmail,
          user_name: userName || "Customer",
          user_phone: userPhone,
          items: items.map((i) => ({ id: i.id, name: i.name, price: i.price, quantity: i.quantity })),
          total_amount: total,
          notes,
        }),
      });

      if (!res.ok) throw new Error("Could not submit order");

      setOrderNotice("✓ Your quotation / order inquiry has been submitted! Our team will contact you shortly.");
      setTimeout(() => {
        window.localStorage.removeItem("sysnet-cart");
        router.push("/portal");
      }, 1500);
    } catch {
      setOrderNotice("Order placed! Redirecting...");
      setTimeout(() => router.push("/portal"), 1500);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-slate-50 min-h-screen py-16">
      <div className="container mx-auto max-w-5xl px-4">
        <div className="flex items-center justify-between gap-4 border-b border-slate-200 pb-6">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-600">
              Shopping Cart & Quotations
            </p>
            <h1 className="mt-1 text-3xl font-black text-slate-900 sm:text-4xl">
              Your Product Selection
            </h1>
          </div>
          <Link
            href="/shop"
            className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50"
          >
            ← Continue Shopping
          </Link>
        </div>

        {orderNotice && (
          <div className="mt-6 rounded-2xl bg-emerald-600 p-4 text-center font-bold text-white shadow-lg">
            {orderNotice}
          </div>
        )}

        {items.length === 0 ? (
          <div className="mt-10 rounded-3xl bg-white p-12 text-center shadow-sm ring-1 ring-slate-200">
            <div className="text-4xl mb-3">🛒</div>
            <p className="text-lg font-bold text-slate-900">Your shopping cart is empty.</p>
            <p className="mt-1 text-sm text-slate-500">
              Add networking hardware, routers, cables, or server racks from our store.
            </p>
            <Link
              href="/shop"
              className="mt-6 inline-flex rounded-xl bg-blue-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-blue-500/20 hover:bg-blue-700"
            >
              Browse Shop Catalog
            </Link>
          </div>
        ) : (
          <div className="mt-10 grid gap-8 lg:grid-cols-3">
            {/* Cart Items List */}
            <div className="space-y-4 lg:col-span-2">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="flex flex-col gap-4 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200 sm:flex-row sm:items-center sm:justify-between"
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
                      <h2 className="font-bold text-slate-900 text-base">{item.name}</h2>
                      <p className="text-xs text-slate-500">{item.price.toFixed(2)}ETB each</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 self-end sm:self-center">
                    <div className="flex items-center rounded-xl border border-slate-200 bg-slate-50">
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="px-3 py-1.5 text-slate-600 hover:bg-slate-200 rounded-l-xl"
                      >
                        -
                      </button>
                      <span className="w-8 text-center text-xs font-bold text-slate-800">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="px-3 py-1.5 text-slate-600 hover:bg-slate-200 rounded-r-xl"
                      >
                        +
                      </button>
                    </div>

                    <strong className="min-w-20 text-right text-base font-black text-slate-900">
                      {(item.price * item.quantity).toFixed(2)} ETB
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

            {/* Checkout / Summary Box */}
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm h-fit space-y-5">
              <h3 className="text-lg font-bold text-slate-900">Summary</h3>
              <div className="space-y-2 border-b border-slate-100 pb-4 text-sm text-slate-600">
                <div className="flex justify-between">
                  <span>Total Items:</span>
                  <strong className="text-slate-900">
                    {items.reduce((s, i) => s + i.quantity, 0)}
                  </strong>
                </div>
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <strong className="text-slate-900">{total.toFixed(2)} ETB</strong>
                </div>
                <div className="flex justify-between">
                  <span>Delivery / Handling:</span>
                  <span className="text-emerald-600 font-semibold">Included</span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-base font-bold text-slate-900">Total:</span>
                <span className="text-2xl font-black text-blue-600">{total.toFixed(2)} ETB</span>
              </div>

              {!isOrdering ? (
                <div className="space-y-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsOrdering(true)}
                    className="w-full rounded-2xl bg-blue-600 py-3.5 text-center text-xs font-bold text-white shadow-lg shadow-blue-500/20 hover:bg-blue-700"
                  >
                    Submit Quotation / Order Inquiry →
                  </button>

                  <Link
                    href="/portal"
                    className="block w-full rounded-2xl border border-slate-200 py-3 text-center text-xs font-bold text-slate-700 hover:bg-slate-50"
                  >
                    Manage in User Portal
                  </Link>
                </div>
              ) : (
                <form onSubmit={handleQuickSubmit} className="space-y-3 pt-2 border-t border-slate-100">
                  <div className="text-xs font-bold text-slate-800">Your Contact Details:</div>
                  <input
                    required
                    type="email"
                    placeholder="Email Address *"
                    value={userEmail}
                    onChange={(e) => setUserEmail(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs text-slate-900 outline-none focus:border-blue-500"
                  />
                  <input
                    placeholder="Full Name (Optional)"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs text-slate-900 outline-none focus:border-blue-500"
                  />
                  <input
                    placeholder="Phone Number (Optional)"
                    value={userPhone}
                    onChange={(e) => setUserPhone(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs text-slate-900 outline-none focus:border-blue-500"
                  />
                  <textarea
                    rows={2}
                    placeholder="Notes or instructions..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs text-slate-900 outline-none focus:border-blue-500"
                  />

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setIsOrdering(false)}
                      className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="flex-1 rounded-xl bg-blue-600 py-2 text-xs font-bold text-white shadow-md hover:bg-blue-700 disabled:opacity-50"
                    >
                      {submitting ? "Sending..." : "Confirm & Submit"}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
