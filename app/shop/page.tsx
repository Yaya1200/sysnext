"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { products as defaultProducts, ProductItem } from "../data/siteData";
import Link from "next/link";
import { CartSummaryLink, useCart } from "../components/CartProvider";

type Currency = "USD" | "ETB";

// Base product prices are stored/displayed as USD.
// ETB is converted only for presentation.
const USD_TO_ETB = 155;

export default function ShopPage() {
  const [catalog, setCatalog] = useState<ProductItem[]>(defaultProducts);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [currency, setCurrency] = useState<Currency>("ETB");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const { addToCart } = useCart();

  useEffect(() => {
    fetch("/api/products")
      .then((response) => (response.ok ? response.json() : Promise.reject()))
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setCatalog(data);
        }
      })
      .catch(() => undefined);
  }, []);

  const categories = [
    "All",
    ...new Set(catalog.map((product) => product.category)),
  ];

  const filteredProducts = useMemo(() => {
    return catalog.filter((product) => {
      const matchesCategory =
        selectedCategory === "All" ||
        product.category === selectedCategory;

      const matchesSearch = product.name
        .toLowerCase()
        .includes(searchTerm.toLowerCase());

      return matchesCategory && matchesSearch;
    });
  }, [catalog, searchTerm, selectedCategory]);

  const formatPrice = (price: number) => {
    const numericPrice = Number(price) || 0;

    if (currency === "ETB") {
      return `ETB ${Math.round(numericPrice * USD_TO_ETB).toLocaleString()}`;
    }

    return `$${numericPrice.toFixed(2)}`;
  };

  const handleAddToCart = (product: ProductItem) => {
    addToCart(product);

    setToastMessage(`✓ Added "${product.name}" to cart!`);

    setTimeout(() => setToastMessage(null), 3000);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-2xl bg-emerald-600 px-5 py-3 text-sm font-bold text-white shadow-2xl animate-fade-in">
          <span>🛒</span>

          <span>{toastMessage}</span>

          <Link
            href="/shop/cart"
            className="ml-2 text-xs underline"
          >
            View Cart →
          </Link>
        </div>
      )}

      <div className="container mx-auto px-4 py-16">
        {/* Hero */}
        <div className="mb-10 overflow-hidden rounded-[32px] bg-gradient-to-r from-slate-950 via-slate-900 to-blue-950 p-8 text-white shadow-xl md:p-12">
          <div className="flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
            <div className="max-w-xl">
              <span className="rounded-full bg-blue-500/20 px-3 py-1 text-xs font-bold uppercase tracking-wider text-blue-300">
                SysNet Hardware & Equipment Store
              </span>

              <h1 className="mt-4 text-4xl font-black tracking-tight sm:text-5xl">
                Enterprise Products & Systems
              </h1>

              <p className="mt-4 text-base text-slate-300">
                Browse certified networking cables, routers, switches,
                enterprise cabinets, and workstations.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <CartSummaryLink />

              <Link
                href="/portal"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-700 bg-slate-800/80 px-5 py-3 text-sm font-bold text-slate-200 hover:bg-slate-700"
              >
                👤 User Portal
              </Link>
            </div>
          </div>
        </div>

        {/* Filter Controls */}
        <div className="mb-12 flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center rounded-xl bg-blue-50 px-3.5 py-2">
              <span className="text-xs font-bold text-blue-700">
                {filteredProducts.length} product
                {filteredProducts.length !== 1 ? "s" : ""} available
              </span>
            </div>
          </div>

          {/* Search */}
          <div className="w-full md:w-1/3">
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {/* Category */}
          <div className="w-full md:w-1/4">
            <select
              value={selectedCategory}
              onChange={(event) =>
                setSelectedCategory(event.target.value)
              }
              className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-2.5 text-sm font-medium text-slate-900 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            >
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          {/* Currency */}
          <div className="w-full md:w-1/5">
            <select
              value={currency}
              onChange={(event) =>
                setCurrency(event.target.value as Currency)
              }
              aria-label="Select currency"
              className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-2.5 text-sm font-bold text-slate-900 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            >
              <option value="ETB">ETB — Ethiopian Birr</option>
              <option value="USD">USD — US Dollar</option>
            </select>
          </div>
        </div>

        {/* Products */}
        {filteredProducts.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-12 text-center text-slate-600 shadow-sm">
            <p className="text-lg font-medium">
              No products match your search.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredProducts.map((product) => (
              <article
                key={product.id}
                className="group flex flex-col justify-between overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl"
              >
                <div>
                  <div className="relative h-64 overflow-hidden bg-slate-100">
                    <Link
                      href={`/shop/${product.id}`}
                      aria-label={`View ${product.name}`}
                    >
                      <Image
                        src={
                          product.image || "/products/product1.jpg"
                        }
                        alt={product.name}
                        width={600}
                        height={500}
                        className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                      />
                    </Link>
                  </div>

                  <div className="p-5">
                    <div className="mb-2 inline-flex rounded-full bg-blue-50 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-blue-700">
                      {product.category}
                    </div>

                    <h3 className="text-lg font-bold text-slate-900 transition group-hover:text-blue-600">
                      <Link href={`/shop/${product.id}`}>
                        {product.name}
                      </Link>
                    </h3>

                    <p className="mt-1 line-clamp-2 text-xs text-slate-500">
                      {product.description ||
                        "High quality IT hardware for business infrastructure."}
                    </p>
                  </div>
                </div>

                <div className="mt-2 flex items-center justify-between gap-3 border-t border-slate-100 p-5 pt-4">
                  <span className="text-lg font-black text-blue-700">
                    {formatPrice(Number(product.price))}
                  </span>

                  <button
                    type="button"
                    onClick={() => handleAddToCart(product)}
                    className="rounded-xl bg-slate-900 px-4 py-2 text-xs font-bold text-white shadow-md transition hover:bg-blue-600 active:scale-95"
                  >
                    + Add to cart
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
