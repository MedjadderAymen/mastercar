import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function BrandModelsPage({
  params,
}: {
  params: Promise<{ brandSlug: string }>;
}) {
  const { brandSlug } = await params;

  const brand = await prisma.brand.findUnique({
    where: { slug: brandSlug },
    include: {
      models: {
        where: { isActive: true },
        orderBy: { name: "asc" },
        include: { _count: { select: { accessories: true } } },
      },
    },
  });

  if (!brand || !brand.isActive) notFound();

  return (
    <div>
      <nav className="mb-6 text-sm text-black/50">
        <Link href="/" className="hover:text-blue-600">
          Brands
        </Link>{" "}
        / <span className="text-black">{brand.name}</span>
      </nav>

      <h1 className="mb-6 text-2xl font-bold">{brand.name} — choose your model</h1>

      {brand.models.length === 0 ? (
        <p className="text-black/50">No models listed for {brand.name} yet.</p>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
          {brand.models.map((model) => (
            <Link
              key={model.id}
              href={`/brands/${brand.slug}/${model.slug}`}
              className="flex flex-col gap-1 rounded-xl border border-black/10 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <span className="font-semibold">{model.name}</span>
              {(model.yearFrom || model.yearTo) && (
                <span className="text-xs text-black/50">
                  {model.yearFrom ?? "—"}–{model.yearTo ?? "present"}
                </span>
              )}
              <span className="mt-2 text-xs text-blue-700">
                {model._count.accessories} accessor{model._count.accessories === 1 ? "y" : "ies"}
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
