"use client";

import Link from "next/link";
import { createContext, useContext, useEffect, useMemo, useState } from "react";

export type CartProduct = {
  id: number;
  name: string;
  price: number;
  image: string;
  category: string;
};

type CartLine = CartProduct & { quantity: number };
type CartContextValue = {
  items: CartLine[];
  itemCount: number;
  total: number;
  addToCart: (product: CartProduct) => void;
  removeFromCart: (productId: number) => void;
  updateQuantity: (productId: number, quantity: number) => void;
};

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartLine[]>([]);

  useEffect(() => {
    const savedCart = window.localStorage.getItem("sysnet-cart");
    if (savedCart) setItems(JSON.parse(savedCart));
  }, []);

  useEffect(() => {
    window.localStorage.setItem("sysnet-cart", JSON.stringify(items));
  }, [items]);

  const value = useMemo(() => ({
    items,
    itemCount: items.reduce((count, item) => count + item.quantity, 0),
    total: items.reduce((sum, item) => sum + item.price * item.quantity, 0),
    addToCart(product: CartProduct) {
      setItems((current) => {
        const existing = current.find((item) => item.id === product.id);
        return existing
          ? current.map((item) => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item)
          : [...current, { ...product, quantity: 1 }];
      });
    },
    removeFromCart(productId: number) {
      setItems((current) => current.filter((item) => item.id !== productId));
    },
    updateQuantity(productId: number, quantity: number) {
      setItems((current) => current.map((item) => item.id === productId ? { ...item, quantity: Math.max(1, quantity) } : item));
    },
  }), [items]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used inside CartProvider");
  return context;
}

export function CartSummaryLink() {
  const { itemCount } = useCart();
  return (
    <Link href="/shop/cart" className="inline-flex items-center gap-2 rounded-full bg-blue-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-blue-700">
      <span aria-hidden="true">🛒</span>
      Cart ({itemCount})
    </Link>
  );
}
