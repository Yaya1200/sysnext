"use client";

import Link from "next/link";
import { useCart } from "../../components/CartProvider";

export default function CartPage() {
  const { items, total, removeFromCart, updateQuantity } = useCart();

  return (
    <div className="bg-slate-50 py-16">
      <div className="container mx-auto max-w-4xl px-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-blue-600">Your selection</p>
            <h1 className="mt-2 text-4xl font-black text-slate-900">Shopping cart</h1>
          </div>
          <Link href="/shop" className="font-semibold text-blue-700 hover:text-blue-900">Continue shopping</Link>
        </div>

        {items.length === 0 ? (
          <div className="mt-10 rounded-2xl bg-white p-12 text-center shadow-sm ring-1 ring-slate-200">
            <p className="text-lg text-slate-600">Your cart is empty.</p>
            <Link href="/shop" className="mt-5 inline-flex rounded-lg bg-blue-600 px-5 py-3 font-bold text-white hover:bg-blue-700">Browse products</Link>
          </div>
        ) : (
          <div className="mt-10 space-y-4">
            {items.map((item) => (
              <div key={item.id} className="flex flex-col gap-4 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="font-bold text-slate-900">{item.name}</h2>
                  <p className="text-sm text-slate-500">${item.price.toFixed(2)} each</p>
                </div>
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 text-sm text-slate-600">
                    Qty
                    <input type="number" min="1" value={item.quantity} onChange={(event) => updateQuantity(item.id, Number(event.target.value))} className="w-16 rounded-lg border border-slate-300 px-2 py-2 text-center" />
                  </label>
                  <strong className="min-w-20 text-right text-slate-900">${(item.price * item.quantity).toFixed(2)}</strong>
                  <button type="button" onClick={() => removeFromCart(item.id)} className="text-sm font-semibold text-red-600 hover:text-red-800">Remove</button>
                </div>
              </div>
            ))}
            <div className="flex items-center justify-between rounded-2xl bg-slate-900 p-6 text-white">
              <span className="text-lg font-semibold">Total</span>
              <span className="text-2xl font-black">${total.toFixed(2)}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
