"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";

function parseAccessoryForm(formData: FormData) {
  return {
    name: String(formData.get("name") || "").trim(),
    description: String(formData.get("description") || "").trim() || null,
    category: String(formData.get("category") || "").trim() || null,
    sku: String(formData.get("sku") || "").trim(),
    imageUrl: String(formData.get("imageUrl") || "").trim() || null,
    buyPrice: Number(formData.get("buyPrice") || 0),
    sellPrice: Number(formData.get("sellPrice") || 0),
    quantity: Number(formData.get("quantity") || 0),
    storageLocation: String(formData.get("storageLocation") || "").trim() || null,
    isActive: formData.get("isActive") === "on",
    modelId: String(formData.get("modelId") || ""),
  };
}

export async function createAccessory(formData: FormData) {
  const data = parseAccessoryForm(formData);
  if (!data.name || !data.sku || !data.modelId) return;

  await prisma.accessory.create({
    data: {
      name: data.name,
      description: data.description,
      category: data.category,
      sku: data.sku,
      imageUrl: data.imageUrl,
      buyPrice: data.buyPrice,
      sellPrice: data.sellPrice,
      quantity: data.quantity,
      storageLocation: data.storageLocation,
      isActive: data.isActive,
      modelId: data.modelId,
    },
  });

  revalidatePath("/admin/accessories");
  revalidatePath("/");
  redirect(`/admin/accessories?modelId=${data.modelId}`);
}

export async function updateAccessory(accessoryId: string, formData: FormData) {
  const data = parseAccessoryForm(formData);
  if (!data.name || !data.sku) return;

  await prisma.accessory.update({
    where: { id: accessoryId },
    data: {
      name: data.name,
      description: data.description,
      category: data.category,
      sku: data.sku,
      imageUrl: data.imageUrl,
      buyPrice: data.buyPrice,
      sellPrice: data.sellPrice,
      quantity: data.quantity,
      storageLocation: data.storageLocation,
      isActive: data.isActive,
    },
  });

  revalidatePath("/admin/accessories");
  revalidatePath(`/admin/accessories/${accessoryId}`);
  revalidatePath("/");
  redirect("/admin/accessories");
}

export async function deleteAccessory(accessoryId: string) {
  await prisma.accessory.delete({ where: { id: accessoryId } });
  revalidatePath("/admin/accessories");
  revalidatePath("/");
  redirect("/admin/accessories");
}
