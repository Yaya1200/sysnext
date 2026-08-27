"use client";

import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { products } from "../../data/siteData";
import { useCart } from "../../components/CartProvider";

export default function ProductDetailPage() {
  const params = useParams<{ id: string }>();
  const product = products.find((item) => item.id === Number(params.id));
  const { addToCart } = useCart();

  if (!product) return <div className="p-16 text-center">Product not found.</div>;

  return (
    <div className="bg-slate-50 py-16">
      <div className="container mx-auto px-4">
        <Link href="/shop" className="text-sm font-semibold text-blue-700 hover:text-blue-900">← Back to shop</Link>
        <div className="mt-8 grid gap-10 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200 md:grid-cols-2 md:p-10">
          <div className="relative min-h-80 overflow-hidden rounded-2xl bg-slate-100">
            <Image src={product.image} alt={product.name} fill className="object-cover" priority />
          </div>
          <div className="flex flex-col justify-center">
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-blue-600">{product.category}</p>
            <h1 className="mt-3 text-4xl font-black text-slate-900">{product.name}</h1>
            <p className="mt-6 text-3xl font-bold text-slate-900">${product.price.toFixed(2)}</p>
            <p className="mt-6 leading-7 text-slate-600">Reliable technology equipment selected for business and institutional use. Add this product to your cart to request it with your order.</p>
            <button type="button" onClick={() => addToCart(product)} className="mt-8 w-fit rounded-lg bg-blue-600 px-6 py-3 font-bold text-white transition hover:bg-blue-700">Add to cart</button>
          </div>
        </div>
      </div>
    </div>
  );
}
