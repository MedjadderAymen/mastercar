import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { updateModel, deleteModel } from "../../brands/actions";

export const dynamic = "force-dynamic";

export default async function EditModelPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const model = await prisma.model.findUnique({
    where: { id },
    include: { brand: true, _count: { select: { accessories: true } } },
  });
  if (!model) notFound();

  const updateWithId = updateModel.bind(null, model.id);
  const deleteWithId = deleteModel.bind(null, model.id, model.brandId);

  return (
    <div className="mx-auto max-w-xl">
      <nav className="mb-4 text-sm text-black/50">
        <Link href="/admin/brands" className="hover:text-blue-600">
          Brands
        </Link>{" "}
        /{" "}
        <Link href={`/admin/brands/${model.brandId}`} className="hover:text-blue-600">
          {model.brand.name}
        </Link>{" "}
        / <span className="text-black">{model.name}</span>
      </nav>

      <h1 className="mb-6 text-2xl font-bold">Edit model</h1>

      <form action={updateWithId} className="space-y-4 rounded-xl border border-black/10 bg-white p-6">
        <input type="hidden" name="brandId" value={model.brandId} />
        <div>
          <label className="mb-1 block text-sm font-medium">Model name *</label>
          <input name="name" required defaultValue={model.name} className="w-full rounded-lg border border-black/20 px-3 py-2" />
        </div>
        <div className="flex gap-4">
          <div className="flex-1">
            <label className="mb-1 block text-sm font-medium">Year from</label>
            <input name="yearFrom" type="number" defaultValue={model.yearFrom ?? ""} className="w-full rounded-lg border border-black/20 px-3 py-2" />
          </div>
          <div className="flex-1">
            <label className="mb-1 block text-sm font-medium">Year to</label>
            <input name="yearTo" type="number" defaultValue={model.yearTo ?? ""} className="w-full rounded-lg border border-black/20 px-3 py-2" />
          </div>
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="isActive" defaultChecked={model.isActive} />
          Visible on storefront
        </label>
        <button type="submit" className="rounded-lg bg-blue-600 px-5 py-2 font-semibold text-white hover:bg-blue-700">
          Save changes
        </button>
      </form>

      <div className="mt-4 flex items-center justify-between">
        <Link href={`/admin/accessories?modelId=${model.id}`} className="text-sm text-blue-600 hover:underline">
          View {model._count.accessories} accessories for this model
        </Link>
        <form action={deleteWithId}>
          <button type="submit" className="text-sm text-red-600 hover:underline">
            Delete this model
          </button>
        </form>
      </div>
    </div>
  );
}
