import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { formatMoney, toNumber } from "@/lib/format";
import { updateAccessory, deleteAccessory } from "../actions";

export const dynamic = "force-dynamic";

export default async function EditAccessoryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const accessory = await prisma.accessory.findUnique({
    where: { id },
    include: { model: { include: { brand: true } } },
  });
  if (!accessory) notFound();

  const updateWithId = updateAccessory.bind(null, accessory.id);
  const deleteWithId = deleteAccessory.bind(null, accessory.id);

  const buy = toNumber(accessory.buyPrice.toString());
  const sell = toNumber(accessory.sellPrice.toString());

  return (
    <div className="mx-auto max-w-2xl">
      <nav className="mb-4 text-sm text-black/50">
        <Link href="/admin/accessories" className="hover:text-blue-600">
          Accessories
        </Link>{" "}
        / <span className="text-black">{accessory.name}</span>
      </nav>
      <h1 className="mb-1 text-2xl font-bold">Edit accessory</h1>
      <p className="mb-6 text-sm text-black/50">
        Fits {accessory.model.brand.name} {accessory.model.name}
      </p>

      <form action={updateWithId} className="space-y-4 rounded-xl border border-black/10 bg-white p-6">
        <div>
          <label className="mb-1 block text-sm font-medium">Name *</label>
          <input name="name" required defaultValue={accessory.name} className="w-full rounded-lg border border-black/20 px-3 py-2" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1 block text-sm font-medium">SKU *</label>
            <input name="sku" required defaultValue={accessory.sku} className="w-full rounded-lg border border-black/20 px-3 py-2" />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Category</label>
            <input name="category" defaultValue={accessory.category || ""} className="w-full rounded-lg border border-black/20 px-3 py-2" />
          </div>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">Description</label>
          <textarea name="description" rows={3} defaultValue={accessory.description || ""} className="w-full rounded-lg border border-black/20 px-3 py-2" />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">Image URL</label>
          <input name="imageUrl" defaultValue={accessory.imageUrl || ""} className="w-full rounded-lg border border-black/20 px-3 py-2" />
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div>
            <label className="mb-1 block text-sm font-medium">Buy price *</label>
            <input name="buyPrice" type="number" step="0.01" min="0" required defaultValue={buy} className="w-full rounded-lg border border-black/20 px-3 py-2" />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Sell price *</label>
            <input name="sellPrice" type="number" step="0.01" min="0" required defaultValue={sell} className="w-full rounded-lg border border-black/20 px-3 py-2" />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Quantity *</label>
            <input name="quantity" type="number" min="0" required defaultValue={accessory.quantity} className="w-full rounded-lg border border-black/20 px-3 py-2" />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Storage location</label>
            <input name="storageLocation" defaultValue={accessory.storageLocation || ""} className="w-full rounded-lg border border-black/20 px-3 py-2" />
          </div>
        </div>

        <p className="text-sm text-black/50">
          Profit per unit: <span className="font-semibold text-green-700">{formatMoney(sell - buy)}</span>
        </p>

        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="isActive" defaultChecked={accessory.isActive} />
          Visible on storefront
        </label>

        <div className="flex items-center justify-between pt-2">
          <button type="submit" className="rounded-lg bg-blue-600 px-5 py-2 font-semibold text-white hover:bg-blue-700">
            Save changes
          </button>
        </div>
      </form>

      <form action={deleteWithId} className="mt-4">
        <button type="submit" className="text-sm text-red-600 hover:underline">
          Delete this accessory
        </button>
      </form>
    </div>
  );
}
