"use server";

import { prisma } from "@/lib/db";
import { generateOrderNumber } from "@/lib/format";

export type PlaceOrderInput = {
  customerName: string;
  phone: string;
  address: string;
  city: string;
  notes?: string;
  items: { accessoryId: string; quantity: number }[];
};

export type PlaceOrderResult =
  | { ok: true; orderNumber: string }
  | { ok: false; error: string };

export async function placeOrder(input: PlaceOrderInput): Promise<PlaceOrderResult> {
  if (!input.customerName?.trim() || !input.phone?.trim() || !input.address?.trim() || !input.city?.trim()) {
    return { ok: false, error: "Please fill in all required fields." };
  }
  if (!input.items || input.items.length === 0) {
    return { ok: false, error: "Your cart is empty." };
  }

  try {
    const orderNumber = await prisma.$transaction(async (tx) => {
      const accessories = await tx.accessory.findMany({
        where: { id: { in: input.items.map((i) => i.accessoryId) } },
      });

      const accessoryMap = new Map(accessories.map((a) => [a.id, a]));
      let total = 0;
      const itemsData: {
        accessoryId: string;
        nameSnapshot: string;
        unitPrice: number;
        quantity: number;
      }[] = [];

      for (const line of input.items) {
        const acc = accessoryMap.get(line.accessoryId);
        if (!acc || !acc.isActive) {
          throw new Error(`One of the items in your cart is no longer available.`);
        }
        if (acc.quantity < line.quantity) {
          throw new Error(`Not enough stock for "${acc.name}" (only ${acc.quantity} left).`);
        }
        const unitPrice = parseFloat(acc.sellPrice.toString());
        total += unitPrice * line.quantity;
        itemsData.push({
          accessoryId: acc.id,
          nameSnapshot: acc.name,
          unitPrice,
          quantity: line.quantity,
        });
      }

      const orderNumber = generateOrderNumber();

      await tx.order.create({
        data: {
          orderNumber,
          customerName: input.customerName.trim(),
          phone: input.phone.trim(),
          address: input.address.trim(),
          city: input.city.trim(),
          notes: input.notes?.trim() || null,
          totalAmount: total,
          items: { create: itemsData },
        },
      });

      for (const line of itemsData) {
        await tx.accessory.update({
          where: { id: line.accessoryId },
          data: { quantity: { decrement: line.quantity } },
        });
      }

      return orderNumber;
    });

    return { ok: true, orderNumber };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Could not place order.";
    return { ok: false, error: message };
  }
}
