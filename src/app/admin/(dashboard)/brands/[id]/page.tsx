import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { updateBrand, deleteBrand, createModel, deleteModel } from "../actions";

export const dynamic = "force-dynamic";

export default async function AdminBrandDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const brand = await prisma.brand.findUnique({
    where: { id },
    include: {
      models: {
        orderBy: { name: "asc" },
        include: { _count: { select: { accessories: true } } },
      },
    },
  });
  if (!brand) notFound();

  const updateBrandWithId = updateBrand.bind(null, brand.id);
  const deleteBrandWithId = deleteBrand.bind(null, brand.id);
  const createModelWithId = createModel.bind(null, brand.id);

  return (
    <div>
      <nav className="mb-4 text-sm text-black/50">
        <Link href="/admin/brands" className="hover:text-blue-600">
          Brands
        </Link>{" "}
        / <span className="text-black">{brand.name}</span>
      </nav>

      <div className="mb-8 grid grid-cols-1 gap-8 lg:grid-cols-2">
        <div className="rounded-xl border border-black/10 bg-white p-4">
          <h2 className="mb-4 font-semibold">Brand details</h2>
          <form action={updateBrandWithId} className="space-y-3">
            <div>
              <label className="mb-1 block text-sm font-medium">Name</label>
              <input
                name="name"
                defaultValue={brand.name}
                required
                className="w-full rounded-lg border border-black/20 px-3 py-2"
              />
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" name="isActive" defaultChecked={brand.isActive} />
              Visible on storefront
            </label>
            <button type="submit" className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700">
              Save changes
            </button>
          </form>

          <form action={deleteBrandWithId} className="mt-4 border-t border-black/10 pt-4">
            <button type="submit" className="text-sm text-red-600 hover:underline">
              Delete brand (and all its models &amp; accessories)
            </button>
          </form>
        </div>

        <div className="rounded-xl border border-black/10 bg-white p-4">
          <h2 className="mb-4 font-semibold">Add a model</h2>
          <form action={createModelWithId} className="space-y-3">
            <div>
              <label className="mb-1 block text-sm font-medium">Model name</label>
              <input name="name" required placeholder="e.g. Corolla" className="w-full rounded-lg border border-black/20 px-3 py-2" />
            </div>
            <div className="flex gap-3">
              <div className="flex-1">
                <label className="mb-1 block text-sm font-medium">Year from</label>
                <input name="yearFrom" type="number" className="w-full rounded-lg border border-black/20 px-3 py-2" />
              </div>
              <div className="flex-1">
                <label className="mb-1 block text-sm font-medium">Year to</label>
                <input name="yearTo" type="number" className="w-full rounded-lg border border-black/20 px-3 py-2" />
              </div>
            </div>
            <button type="submit" className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700">
              Add model
            </button>
          </form>
        </div>
      </div>

      <h2 className="mb-3 text-lg font-semibold">Models</h2>
      <div className="overflow-hidden rounded-xl border border-black/10 bg-white">
        <table className="w-full text-sm">
          <thead className="bg-black/5 text-left">
            <tr>
              <th className="p-3">Model</th>
              <th className="p-3">Years</th>
              <th className="p-3">Accessories</th>
              <th className="p-3"></th>
            </tr>
          </thead>
          <tbody>
            {brand.models.map((model) => {
              const deleteModelWithId = deleteModel.bind(null, model.id, brand.id);
              return (
                <tr key={model.id} className="border-t border-black/5">
                  <td className="p-3 font-medium">{model.name}</td>
                  <td className="p-3 text-black/60">
                    {model.yearFrom ?? "—"}–{model.yearTo ?? "present"}
                  </td>
                  <td className="p-3">{model._count.accessories}</td>
                  <td className="p-3 text-right">
                    <div className="flex justify-end gap-3">
                      <Link href={`/admin/models/${model.id}`} className="text-blue-600 hover:underline">
                        Edit
                      </Link>
                      <Link href={`/admin/accessories?modelId=${model.id}`} className="text-blue-600 hover:underline">
                        View accessories
                      </Link>
                      <Link href={`/admin/accessories/new?modelId=${model.id}`} className="text-blue-600 hover:underline">
                        Add accessory
                      </Link>
                      <form action={deleteModelWithId}>
                        <button type="submit" className="text-red-600 hover:underline">
                          Delete
                        </button>
                      </form>
                    </div>
                  </td>
                </tr>
              );
            })}
            {brand.models.length === 0 && (
              <tr>
                <td colSpan={4} className="p-4 text-center text-black/50">
                  No models yet — add one above.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
