import Link from "next/link";
import { prisma } from "@/lib/db";
import { createBrand } from "./actions";

export const dynamic = "force-dynamic";

export default async function AdminBrandsPage() {
  const brands = await prisma.brand.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { models: true } } },
  });

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Brands &amp; models</h1>

      <form action={createBrand} className="mb-8 flex flex-wrap items-end gap-3 rounded-xl border border-black/10 bg-white p-4">
        <div>
          <label className="mb-1 block text-sm font-medium">New brand name</label>
          <input
            name="name"
            required
            placeholder="e.g. Nissan"
            className="rounded-lg border border-black/20 px-3 py-2"
          />
        </div>
        <button type="submit" className="rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-700">
          Add brand
        </button>
      </form>

      <div className="overflow-hidden rounded-xl border border-black/10 bg-white">
        <table className="w-full text-sm">
          <thead className="bg-black/5 text-left">
            <tr>
              <th className="p-3">Brand</th>
              <th className="p-3">Models</th>
              <th className="p-3">Status</th>
              <th className="p-3"></th>
            </tr>
          </thead>
          <tbody>
            {brands.map((brand) => (
              <tr key={brand.id} className="border-t border-black/5">
                <td className="p-3 font-medium">{brand.name}</td>
                <td className="p-3">{brand._count.models}</td>
                <td className="p-3">
                  <span
                    className={`rounded-full px-2 py-1 text-xs font-medium ${
                      brand.isActive ? "bg-green-50 text-green-700" : "bg-black/5 text-black/50"
                    }`}
                  >
                    {brand.isActive ? "Active" : "Hidden"}
                  </span>
                </td>
                <td className="p-3 text-right">
                  <Link href={`/admin/brands/${brand.id}`} className="text-blue-600 hover:underline">
                    Manage
                  </Link>
                </td>
              </tr>
            ))}
            {brands.length === 0 && (
              <tr>
                <td colSpan={4} className="p-4 text-center text-black/50">
                  No brands yet — add one above.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
