import Link from "next/link";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const brands = await prisma.brand.findMany({
    where: { isActive: true },
    orderBy: { name: "asc" },
    include: { _count: { select: { models: true } } },
  });

  return (
    <div>
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold tracking-tight">Find accessories for your car</h1>
        <p className="mt-2 text-black/60">
          Pick your car&rsquo;s brand, then the exact model, to see accessories that fit.
        </p>
      </div>

      {brands.length === 0 ? (
        <p className="text-center text-black/50">No brands available yet. Check back soon.</p>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
          {brands.map((brand) => (
            <Link
              key={brand.id}
              href={`/brands/${brand.slug}`}
              className="flex flex-col items-center justify-center gap-2 rounded-xl border border-black/10 bg-white p-6 text-center shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <span className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-50 text-xl font-bold text-blue-700">
                {brand.name.charAt(0)}
              </span>
              <span className="font-semibold">{brand.name}</span>
              <span className="text-xs text-black/50">
                {brand._count.models} model{brand._count.models === 1 ? "" : "s"}
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
