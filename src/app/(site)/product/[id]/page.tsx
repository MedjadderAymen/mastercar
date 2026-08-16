import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { formatMoney, toNumber } from "@/lib/format";
import AddToCartButton from "@/components/add-to-cart-button";

export const dynamic = "force-dynamic";

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const accessory = await prisma.accessory.findUnique({
    where: { id },
    include: { model: { include: { brand: true } } },
  });

  if (!accessory || !accessory.isActive) notFound();

  const { model } = accessory;
  const { brand } = model;

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
        /{" "}
        <Link href={`/brands/${brand.slug}/${model.slug}`} className="hover:text-blue-600">
          {model.name}
        </Link>{" "}
        / <span className="text-black">{accessory.name}</span>
      </nav>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        <div className="flex aspect-square items-center justify-center rounded-xl border border-black/10 bg-white text-black/20">
          {accessory.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={accessory.imageUrl}
              alt={accessory.name}
              className="h-full w-full rounded-xl object-cover"
            />
          ) : (
            <span className="text-sm">No image</span>
          )}
        </div>

        <div>
          <p className="text-sm text-black/50">
            Fits {brand.name} {model.name}
          </p>
          <h1 className="mt-1 text-2xl font-bold">{accessory.name}</h1>
          {accessory.category && (
            <span className="mt-2 inline-block rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
              {accessory.category}
            </span>
          )}
          <div className="mt-4 text-3xl font-bold text-blue-700">
            {formatMoney(toNumber(accessory.sellPrice.toString()))}
          </div>
          <p className="mt-1 text-sm text-black/50">SKU: {accessory.sku}</p>
          <p className="mt-1 text-sm text-black/50">
            {accessory.quantity > 0 ? `${accessory.quantity} in stock` : "Out of stock"}
          </p>

          {accessory.description && (
            <p className="mt-4 whitespace-pre-line text-black/70">{accessory.description}</p>
          )}

          <div className="mt-6 max-w-xs">
            <AddToCartButton
              accessoryId={accessory.id}
              name={accessory.name}
              sku={accessory.sku}
              unitPrice={toNumber(accessory.sellPrice.toString())}
              imageUrl={accessory.imageUrl}
              brandName={brand.name}
              modelName={model.name}
              maxQuantity={accessory.quantity}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
