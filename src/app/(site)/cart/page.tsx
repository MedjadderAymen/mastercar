"use client";

import Link from "next/link";
import { useCart } from "@/lib/cart-context";
import { formatMoney } from "@/lib/format";

export default function CartPage() {
  const { items, removeItem, updateQuantity, totalPrice } = useCart();

  if (items.length === 0) {
    return (
      <div className="py-16 text-center">
        <h1 className="text-2xl font-bold">Your cart is empty</h1>
        <p className="mt-2 text-black/50">Browse by brand and model to find accessories.</p>
        <Link
          href="/"
          className="mt-6 inline-block rounded-lg bg-blue-600 px-5 py-2 font-semibold text-white hover:bg-blue-700"
        >
          Shop by brand
        </Link>
      </div>
    );
  }

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Your cart</h1>
      <div className="space-y-3">
        {items.map((item) => (
          <div
            key={item.accessoryId}
            className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-black/10 bg-white p-4"
          >
            <div>
              <div className="font-semibold">{item.name}</div>
              <div className="text-xs text-black/50">
                Fits {item.brandName} {item.modelName} · SKU {item.sku}
              </div>
            </div>
            <div className="flex items-center gap-4">
              <input
                type="number"
                min={1}
                max={item.maxQuantity}
                value={item.quantity}
                onChange={(e) => updateQuantity(item.accessoryId, parseInt(e.target.value) || 1)}
                className="w-16 rounded-lg border border-black/20 px-2 py-1 text-center"
              />
              <div className="w-24 text-right font-semibold">
                {formatMoney(item.unitPrice * item.quantity)}
              </div>
              <button
                onClick={() => removeItem(item.accessoryId)}
                className="text-sm text-red-600 hover:underline"
              >
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 flex flex-col items-end gap-3 border-t border-black/10 pt-6">
        <div className="text-lg">
          Total: <span className="font-bold">{formatMoney(totalPrice)}</span>
        </div>
        <Link
          href="/checkout"
          className="rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700"
        >
          Proceed to checkout
        </Link>
      </div>
    </div>
  );
}
