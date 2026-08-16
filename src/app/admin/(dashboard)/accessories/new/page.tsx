import Link from "next/link";
import { prisma } from "@/lib/db";
import { createAccessory } from "../actions";

export const dynamic = "force-dynamic";

export default async function NewAccessoryPage({
  searchParams,
}: {
  searchParams: Promise<{ modelId?: string }>;
}) {
  const { modelId } = await searchParams;
  const brands = await prisma.brand.findMany({
    orderBy: { name: "asc" },
    include: { models: { orderBy: { name: "asc" } } },
  });

  return (
    <div className="mx-auto max-w-2xl">
      <nav className="mb-4 text-sm text-black/50">
        <Link href="/admin/accessories" className="hover:text-blue-600">
          Accessories
        </Link>{" "}
        / <span className="text-black">New</span>
      </nav>
      <h1 className="mb-6 text-2xl font-bold">Add accessory</h1>

      <form action={createAccessory} className="space-y-4 rounded-xl border border-black/10 bg-white p-6">
        <div>
          <label className="mb-1 block text-sm font-medium">Fits model *</label>
          <select
            name="modelId"
            required
            defaultValue={modelId || ""}
            className="w-full rounded-lg border border-black/20 px-3 py-2"
          >
            <option value="" disabled>
              Select a brand + model
            </option>
            {brands.map((brand) => (
              <optgroup key={brand.id} label={brand.name}>
                {brand.models.map((model) => (
                  <option key={model.id} value={model.id}>
                    {model.name}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">Name *</label>
          <input name="name" required className="w-full rounded-lg border border-black/20 px-3 py-2" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1 block text-sm font-medium">SKU *</label>
            <input name="sku" required className="w-full rounded-lg border border-black/20 px-3 py-2" />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Category</label>
            <input name="category" className="w-full rounded-lg border border-black/20 px-3 py-2" />
          </div>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">Description</label>
          <textarea name="description" rows={3} className="w-full rounded-lg border border-black/20 px-3 py-2" />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">Image URL</label>
          <input name="imageUrl" placeholder="https://..." className="w-full rounded-lg border border-black/20 px-3 py-2" />
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div>
            <label className="mb-1 block text-sm font-medium">Buy price *</label>
            <input name="buyPrice" type="number" step="0.01" min="0" required className="w-full rounded-lg border border-black/20 px-3 py-2" />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Sell price *</label>
            <input name="sellPrice" type="number" step="0.01" min="0" required className="w-full rounded-lg border border-black/20 px-3 py-2" />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Quantity *</label>
            <input name="quantity" type="number" min="0" defaultValue={0} required className="w-full rounded-lg border border-black/20 px-3 py-2" />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Storage location</label>
            <input name="storageLocation" placeholder="e.g. A1-03" className="w-full rounded-lg border border-black/20 px-3 py-2" />
          </div>
        </div>

        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="isActive" defaultChecked />
          Visible on storefront
        </label>

        <button type="submit" className="rounded-lg bg-blue-600 px-5 py-2 font-semibold text-white hover:bg-blue-700">
          Create accessory
        </button>
      </form>
    </div>
  );
}
