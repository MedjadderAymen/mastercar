import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { formatMoney, toNumber } from "@/lib/format";
import AddToCartButton from "@/components/add-to-cart-button";

export const dynamic = "force-dynamic";

export default async function ModelAccessoriesPage({
  params,
}: {
  params: Promise<{ brandSlug: string; modelSlug: string }>;
}) {
  const { brandSlug, modelSlug } = await params;

  const brand = await prisma.brand.findUnique({ where: { slug: brandSlug } });
  if (!brand) notFound();

  const model = await prisma.model.findUnique({
    where: { brandId_slug: { brandId: brand.id, slug: modelSlug } },
    include: {
      accessories: {
        where: { isActive: true },
        orderBy: { name: "asc" },
      },
    },
  });
  if (!model) notFound();

  return (
    <div>
      <nav className="mb-6 text-sm text-black/50">
        <Link href="/" className="hover:text-blue-600">
          Brands
        </Link>{" "}
        /{" "}
        <Link href={`/brands/${brand.slug}`} className="hover:text-blue-600">
          {brand.name}
        </Link>{" "}
        / <span className="text-black">{model.name}</span>
      </nav>

      <h1 className="mb-1 text-2xl font-bold">
        {brand.name} {model.name} — Accessories
      </h1>
      {(model.yearFrom || model.yearTo) && (
        <p className="mb-6 text-sm text-black/50">
          Fits model years {model.yearFrom ?? "—"}–{model.yearTo ?? "present"}
        </p>
      )}

      {model.accessories.length === 0 ? (
        <p className="text-black/50">No accessories listed for this model yet.</p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {model.accessories.map((acc) => (
            <div
              key={acc.id}
              className="flex flex-col justify-between rounded-xl border border-black/10 bg-white p-4 shadow-sm"
            >
              <div>
                <Link href={`/product/${acc.id}`} className="font-semibold hover:text-blue-600">
                  {acc.name}
                </Link>
                {acc.category && (
                  <div className="mt-1 text-xs text-black/50">{acc.category}</div>
                )}
                <div className="mt-2 text-lg font-bold text-blue-700">
                  {formatMoney(toNumber(acc.sellPrice.toString()))}
                </div>
                <div className="mt-1 text-xs text-black/40">
                  {acc.quantity > 0 ? `${acc.quantity} in stock` : "Out of stock"}
                </div>
              </div>
              <div className="mt-4">
                <AddToCartButton
                  accessoryId={acc.id}
                  name={acc.name}
                  sku={acc.sku}
                  unitPrice={toNumber(acc.sellPrice.toString())}
                  imageUrl={acc.imageUrl}
                  brandName={brand.name}
                  modelName={model.name}
                  maxQuantity={acc.quantity}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
