"use client";

import { useState } from "react";
import { useCart } from "@/lib/cart-context";

type Props = {
  accessoryId: string;
  name: string;
  sku: string;
  unitPrice: number;
  imageUrl?: string | null;
  brandName: string;
  modelName: string;
  maxQuantity: number;
};

export default function AddToCartButton(props: Props) {
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);
  const outOfStock = props.maxQuantity <= 0;

  return (
    <button
      type="button"
      disabled={outOfStock}
      onClick={() => {
        addItem(props, 1);
        setAdded(true);
        setTimeout(() => setAdded(false), 1200);
      }}
      className={`w-full rounded-lg px-4 py-2 text-sm font-semibold transition ${
        outOfStock
          ? "cursor-not-allowed bg-black/10 text-black/40"
          : added
            ? "bg-green-600 text-white"
            : "bg-blue-600 text-white hover:bg-blue-700"
      }`}
    >
      {outOfStock ? "Out of stock" : added ? "Added ✓" : "Add to cart"}
    </button>
  );
}
