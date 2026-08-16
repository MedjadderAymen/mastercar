"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import type { OrderStatus } from "@prisma/client";

const VALID_STATUSES: OrderStatus[] = [
  "SUBMITTED",
  "CONFIRMED",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
  "CANCELED",
];

export async function updateOrderStatus(orderId: string, formData: FormData) {
  const status = String(formData.get("status") || "") as OrderStatus;
  if (!VALID_STATUSES.includes(status)) return;

  await prisma.$transaction(async (tx) => {
    const order = await tx.order.findUnique({ where: { id: orderId }, include: { items: true } });
    if (!order) return;

    // Restock inventory when an order is canceled (once).
    if (status === "CANCELED" && order.status !== "CANCELED") {
      for (const item of order.items) {
        if (item.accessoryId) {
          await tx.accessory.update({
            where: { id: item.accessoryId },
            data: { quantity: { increment: item.quantity } },
          });
        }
      }
    }

    // Re-deduct inventory if a canceled order is reactivated.
    if (order.status === "CANCELED" && status !== "CANCELED") {
      for (const item of order.items) {
        if (item.accessoryId) {
          await tx.accessory.update({
            where: { id: item.accessoryId },
            data: { quantity: { decrement: item.quantity } },
          });
        }
      }
    }

    await tx.order.update({ where: { id: orderId }, data: { status } });
  });

  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${orderId}`);
  revalidatePath("/admin");
}
