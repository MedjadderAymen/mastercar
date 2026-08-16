import Link from "next/link";
import { prisma } from "@/lib/db";
import { formatMoney, toNumber } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function AdminAccessoriesPage({
  searchParams,
}: {
  searchParams: Promise<{ modelId?: string; brandId?: string; q?: string }>;
}) {
  const { modelId, brandId, q } = await searchParams;

  const [accessories, brands] = await Promise.all([
    prisma.accessory.findMany({
      where: {
        ...(modelId ? { modelId } : {}),
        ...(brandId ? { model: { brandId } } : {}),
        ...(q ? { name: { contains: q, mode: "insensitive" } } : {}),
      },
      orderBy: { updatedAt: "desc" },
      include: { model: { include: { brand: true } } },
    }),
    prisma.brand.findMany({ orderBy: { name: "asc" }, include: { models: { orderBy: { name: "asc" } } } }),
  ]);

  const filteredModel = modelId
    ? brands.flatMap((b) => b.models).find((m) => m.id === modelId)
    : null;

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">
          Accessories &amp; stock
          {filteredModel && <span className="ml-2 text-base font-normal text-black/50">— {filteredModel.name}</span>}
        </h1>
        <Link
          href={modelId ? `/admin/accessories/new?modelId=${modelId}` : "/admin/accessories/new"}
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
        >
          + Add accessory
        </Link>
      </div>

      <form className="mb-4 flex flex-wrap gap-3" method="get">
        <input
          name="q"
          defaultValue={q}
          placeholder="Search by name..."
          className="rounded-lg border border-black/20 px-3 py-2 text-sm"
        />
        <select name="brandId" defaultValue={brandId || ""} className="rounded-lg border border-black/20 px-3 py-2 text-sm">
          <option value="">All brands</option>
          {brands.map((b) => (
            <option key={b.id} value={b.id}>
              {b.name}
            </option>
          ))}
        </select>
        <button type="submit" className="rounded-lg border border-black/20 px-4 py-2 text-sm hover:bg-black/5">
          Filter
        </button>
        {(modelId || brandId || q) && (
          <Link href="/admin/accessories" className="px-2 py-2 text-sm text-blue-600 hover:underline">
            Clear filters
          </Link>
        )}
      </form>

      <div className="overflow-x-auto rounded-xl border border-black/10 bg-white">
        <table className="w-full min-w-[820px] text-sm">
          <thead className="bg-black/5 text-left">
            <tr>
              <th className="p-3">Name</th>
              <th className="p-3">Fits</th>
              <th className="p-3">SKU</th>
              <th className="p-3">Storage</th>
              <th className="p-3 text-right">Qty</th>
              <th className="p-3 text-right">Buy</th>
              <th className="p-3 text-right">Sell</th>
              <th className="p-3 text-right">Profit / unit</th>
              <th className="p-3"></th>
            </tr>
          </thead>
          <tbody>
            {accessories.map((acc) => {
              const buy = toNumber(acc.buyPrice.toString());
              const sell = toNumber(acc.sellPrice.toString());
              const profit = sell - buy;
              return (
                <tr key={acc.id} className="border-t border-black/5">
                  <td className="p-3 font-medium">
                    {acc.name}
                    {!acc.isActive && <span className="ml-2 text-xs text-black/40">(hidden)</span>}
                  </td>
                  <td className="p-3 text-black/60">
                    {acc.model.brand.name} {acc.model.name}
                  </td>
                  <td className="p-3 font-mono text-xs text-black/50">{acc.sku}</td>
                  <td className="p-3 text-black/60">{acc.storageLocation || "—"}</td>
                  <td className={`p-3 text-right font-semibold ${acc.quantity <= 5 ? "text-red-600" : ""}`}>
                    {acc.quantity}
                  </td>
                  <td className="p-3 text-right">{formatMoney(buy)}</td>
                  <td className="p-3 text-right">{formatMoney(sell)}</td>
                  <td className={`p-3 text-right font-semibold ${profit >= 0 ? "text-green-700" : "text-red-600"}`}>
                    {formatMoney(profit)}
                  </td>
                  <td className="p-3 text-right">
                    <Link href={`/admin/accessories/${acc.id}`} className="text-blue-600 hover:underline">
                      Edit
                    </Link>
                  </td>
                </tr>
              );
            })}
            {accessories.length === 0 && (
              <tr>
                <td colSpan={9} className="p-4 text-center text-black/50">
                  No accessories match these filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
