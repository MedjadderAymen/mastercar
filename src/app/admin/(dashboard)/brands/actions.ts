"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { slugify } from "@/lib/format";

export async function createBrand(formData: FormData) {
  const name = String(formData.get("name") || "").trim();
  if (!name) return;

  const slug = slugify(name);
  await prisma.brand.create({ data: { name, slug } });
  revalidatePath("/admin/brands");
  revalidatePath("/");
}

export async function updateBrand(brandId: string, formData: FormData) {
  const name = String(formData.get("name") || "").trim();
  const isActive = formData.get("isActive") === "on";
  if (!name) return;

  await prisma.brand.update({
    where: { id: brandId },
    data: { name, slug: slugify(name), isActive },
  });
  revalidatePath("/admin/brands");
  revalidatePath(`/admin/brands/${brandId}`);
  revalidatePath("/");
}

export async function deleteBrand(brandId: string) {
  await prisma.brand.delete({ where: { id: brandId } });
  revalidatePath("/admin/brands");
  revalidatePath("/");
  redirect("/admin/brands");
}

export async function createModel(brandId: string, formData: FormData) {
  const name = String(formData.get("name") || "").trim();
  const yearFrom = formData.get("yearFrom") ? Number(formData.get("yearFrom")) : null;
  const yearTo = formData.get("yearTo") ? Number(formData.get("yearTo")) : null;
  if (!name) return;

  await prisma.model.create({
    data: { name, slug: slugify(name), brandId, yearFrom, yearTo },
  });
  revalidatePath(`/admin/brands/${brandId}`);
  revalidatePath("/");
}

export async function updateModel(modelId: string, formData: FormData) {
  const name = String(formData.get("name") || "").trim();
  const yearFrom = formData.get("yearFrom") ? Number(formData.get("yearFrom")) : null;
  const yearTo = formData.get("yearTo") ? Number(formData.get("yearTo")) : null;
  const isActive = formData.get("isActive") === "on";
  const brandId = String(formData.get("brandId") || "");
  if (!name) return;

  await prisma.model.update({
    where: { id: modelId },
    data: { name, slug: slugify(name), yearFrom, yearTo, isActive },
  });
  revalidatePath(`/admin/brands/${brandId}`);
  revalidatePath("/");
}

export async function deleteModel(modelId: string, brandId: string) {
  await prisma.model.delete({ where: { id: modelId } });
  revalidatePath(`/admin/brands/${brandId}`);
  revalidatePath("/");
}
