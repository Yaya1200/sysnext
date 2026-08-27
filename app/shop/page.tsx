"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { products } from "../data/siteData";
import Link from "next/link";
import { CartSummaryLink, useCart } from "../components/CartProvider";

export default function ShopPage() {
  const [catalog, setCatalog] = useState(products);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const { addToCart } = useCart();

  useEffect(() => {
    fetch("/api/products")
      .then((response) => (response.ok ? response.json() : Promise.reject(new Error("Product request failed"))))
      .then(setCatalog)
      .catch(() => undefined);
  }, []);

  const categories = ["All", ...new Set(catalog.map((product) => product.category))];

  const filteredProducts = useMemo(() => {
    return catalog.filter((product) => {
      const matchesCategory = selectedCategory === "All" || product.category === selectedCategory;
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [searchTerm, selectedCategory]);

  return (
    <div className="bg-slate-50 text-slate-900">
      <div className="container mx-auto px-4 py-16">
        <div className="mb-10 overflow-hidden rounded-[32px] bg-gradient-to-r from-slate-950 via-slate-900 to-blue-900 p-8 text-white shadow-xl md:p-12">
          <div className="flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
            <div className="max-w-xl">
              <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-blue-200">SysNet Store</p>
              <h1 className="text-4xl font-black tracking-tight md:text-5xl">Technology products for modern businesses</h1>
              <p className="mt-4 text-base text-slate-300">Browse our curated selection of premium IT hardware and networking solutions designed for businesses and institutions.</p>
            </div>
            <CartSummaryLink />
          </div>
        </div>

        <div className="mb-12 flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center rounded-lg bg-blue-100 px-3 py-2">
              <span className="text-sm font-semibold text-blue-700">Showing {filteredProducts.length} result{filteredProducts.length !== 1 ? 's' : ''}</span>
            </div>
          </div>
          <div className="w-full md:w-2/3">
            <label className="mb-2 block text-sm font-medium text-slate-700">Search products</label>
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
            />
          </div>

          <div className="w-full md:w-1/3">
            <label className="mb-2 block text-sm font-medium text-slate-700">Category</label>
            <select
              value={selectedCategory}
              onChange={(event) => setSelectedCategory(event.target.value)}
              className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
            >
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>
        </div>

        {filteredProducts.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center text-slate-600 shadow-sm">
            <p className="text-lg font-medium">No products match your search.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 xl:grid-cols-4">
            {filteredProducts.map((product) => (
              <article key={product.id} className="group overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl">
                <div className="relative h-64 overflow-hidden bg-slate-100">
                  <Link href={`/shop/${product.id}`} aria-label={`View ${product.name}`}>
                    <Image src={product.image} alt={product.name} fill className="object-cover transition duration-300 group-hover:scale-105" />
                  </Link>
                </div>
                <div className="p-5">
                  <div className="mb-2 inline-flex rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold uppercase tracking-wide text-blue-700">
                    {product.category}
                  </div>
                  <h3 className="text-xl font-bold text-slate-900">{product.name}</h3>
                  <div className="mt-4 flex items-center justify-between gap-3">
                    <span className="font-bold text-blue-700">${product.price.toFixed(2)}</span>
                    <button type="button" onClick={() => addToCart(product)} className="rounded-lg bg-slate-900 px-3 py-2 text-sm font-semibold text-white transition hover:bg-blue-700">
                      Add to cart
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
