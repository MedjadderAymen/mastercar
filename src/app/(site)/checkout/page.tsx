"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useCart } from "@/lib/cart-context";
import { formatMoney } from "@/lib/format";
import { placeOrder } from "./actions";

export default function CheckoutPage() {
  const { items, totalPrice, clear } = useCart();
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({ customerName: "", phone: "", address: "", city: "", notes: "" });

  if (items.length === 0) {
    return (
      <div className="py-16 text-center">
        <h1 className="text-2xl font-bold">Your cart is empty</h1>
        <Link href="/" className="mt-6 inline-block rounded-lg bg-blue-600 px-5 py-2 font-semibold text-white">
          Shop by brand
        </Link>
      </div>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const result = await placeOrder({
      ...form,
      items: items.map((i) => ({ accessoryId: i.accessoryId, quantity: i.quantity })),
    });

    if (result.ok) {
      clear();
      router.push(`/order/${result.orderNumber}`);
    } else {
      setError(result.error);
      setSubmitting(false);
    }
  }

  return (
    <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
      <div>
        <h1 className="mb-6 text-2xl font-bold">Checkout</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium">Full name *</label>
            <input
              required
              value={form.customerName}
              onChange={(e) => setForm({ ...form, customerName: e.target.value })}
              className="w-full rounded-lg border border-black/20 px-3 py-2"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Phone number *</label>
            <input
              required
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className="w-full rounded-lg border border-black/20 px-3 py-2"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">City *</label>
            <input
              required
              value={form.city}
              onChange={(e) => setForm({ ...form, city: e.target.value })}
              className="w-full rounded-lg border border-black/20 px-3 py-2"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Delivery address *</label>
            <textarea
              required
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              className="w-full rounded-lg border border-black/20 px-3 py-2"
              rows={3}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Notes (optional)</label>
            <textarea
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              className="w-full rounded-lg border border-black/20 px-3 py-2"
              rows={2}
            />
          </div>

          <p className="text-sm text-black/50">
            Payment: <strong>Cash on delivery</strong>. You&rsquo;ll pay when your order arrives.
          </p>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
          >
            {submitting ? "Placing order..." : "Place order"}
          </button>
        </form>
      </div>

      <div>
        <h2 className="mb-4 text-lg font-semibold">Order summary</h2>
        <div className="space-y-2 rounded-xl border border-black/10 bg-white p-4">
          {items.map((item) => (
            <div key={item.accessoryId} className="flex justify-between text-sm">
              <span>
                {item.name} × {item.quantity}
              </span>
              <span className="font-medium">{formatMoney(item.unitPrice * item.quantity)}</span>
            </div>
          ))}
          <div className="mt-3 flex justify-between border-t border-black/10 pt-3 font-bold">
            <span>Total</span>
            <span>{formatMoney(totalPrice)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
