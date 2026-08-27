"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { products as defaultProducts, ProductItem } from "../../data/siteData";
import { useCart } from "../../components/CartProvider";

export default function ProductDetailPage() {
  const params = useParams<{ id: string }>();
  const [product, setProduct] = useState<ProductItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [addedToast, setAddedToast] = useState(false);
  const { addToCart } = useCart();

  useEffect(() => {
    fetch("/api/products")
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then((data: ProductItem[]) => {
        const found = data.find((p) => String(p.id) === params.id);
        if (found) setProduct(found);
        else {
          const fallback = defaultProducts.find((p) => String(p.id) === params.id);
          setProduct(fallback || null);
        }
      })
      .catch(() => {
        const fallback = defaultProducts.find((p) => String(p.id) === params.id);
        setProduct(fallback || null);
      })
      .finally(() => setLoading(false));
  }, [params.id]);

  const handleAdd = () => {
    if (!product) return;
    addToCart(product);
    setAddedToast(true);
    setTimeout(() => setAddedToast(false), 3000);
  };

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center bg-slate-50">
        <p className="text-slate-500 font-semibold">Loading product details...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-3xl font-black text-slate-900">Product not found</h1>
        <p className="mt-2 text-slate-600">The product you are looking for does not exist.</p>
        <Link
          href="/shop"
          className="mt-6 inline-flex rounded-xl bg-blue-600 px-6 py-3 font-bold text-white shadow-lg hover:bg-blue-700"
        >
          Back to Store
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-slate-50 min-h-screen py-16">
      <div className="container mx-auto px-4 max-w-5xl">
        <Link
          href="/shop"
          className="inline-flex items-center gap-2 text-sm font-bold text-blue-700 hover:text-blue-900 mb-6"
        >
          ← Back to store catalog
        </Link>

        {addedToast && (
          <div className="mb-6 flex items-center justify-between rounded-2xl bg-emerald-600 px-5 py-3 text-sm font-bold text-white shadow-lg">
            <span>✓ Added "{product.name}" to your shopping cart!</span>
            <Link href="/shop/cart" className="underline text-xs">
              Go to Cart →
            </Link>
          </div>
        )}

        <div className="grid gap-10 rounded-3xl bg-white p-6 sm:p-10 shadow-sm ring-1 ring-slate-200 md:grid-cols-2">
          <div className="relative min-h-80 overflow-hidden rounded-2xl bg-slate-100 flex items-center justify-center">
            <img
              src={product.image || "/products/product1.jpg"}
              alt={product.name}
              className="max-h-96 w-full object-cover rounded-2xl"
            />
          </div>

          <div className="flex flex-col justify-center">
            <span className="w-fit rounded-full bg-blue-50 px-3 py-1 text-xs font-bold uppercase tracking-wider text-blue-700">
              {product.category}
            </span>
            <h1 className="mt-3 text-3xl font-black text-slate-900 sm:text-4xl">
              {product.name}
            </h1>

            <div className="mt-4 flex items-center gap-3">
              <span className="text-3xl font-black text-blue-700">
                ${Number(product.price).toFixed(2)}
              </span>
              <span className="rounded-md bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700 border border-emerald-200">
                In Stock & Verified
              </span>
            </div>

            <p className="mt-6 leading-7 text-slate-600 text-sm">
              {product.description ||
                "High quality IT infrastructure hardware selected for business, factory, and institutional use. Add this product to your cart to request a formal quotation or order."}
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-4">
              <button
                type="button"
                onClick={handleAdd}
                className="rounded-xl bg-blue-600 px-8 py-3.5 text-sm font-bold text-white shadow-lg shadow-blue-500/30 transition hover:bg-blue-700 active:scale-95"
              >
                + Add to Shopping Cart
              </button>
              <Link
                href="/shop/cart"
                className="rounded-xl border border-slate-200 bg-slate-50 px-6 py-3.5 text-sm font-bold text-slate-700 hover:bg-slate-100"
              >
                View Cart 🛒
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
