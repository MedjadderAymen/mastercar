import Link from "next/link";
import { prisma } from "@/lib/db";
import { formatMoney, toNumber } from "@/lib/format";
import type { OrderStatus } from "@prisma/client";

export const dynamic = "force-dynamic";

const ALL_STATUSES: OrderStatus[] = [
  "SUBMITTED",
  "CONFIRMED",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
  "CANCELED",
];

const STATUS_COLORS: Record<string, string> = {
  SUBMITTED: "bg-blue-50 text-blue-700",
  CONFIRMED: "bg-indigo-50 text-indigo-700",
  PROCESSING: "bg-amber-50 text-amber-700",
  SHIPPED: "bg-purple-50 text-purple-700",
  DELIVERED: "bg-green-50 text-green-700",
  CANCELED: "bg-red-50 text-red-700",
};

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; q?: string }>;
}) {
  const { status, q } = await searchParams;

  const orders = await prisma.order.findMany({
    where: {
      ...(status ? { status: status as OrderStatus } : {}),
      ...(q
        ? {
            OR: [
              { orderNumber: { contains: q, mode: "insensitive" } },
              { customerName: { contains: q, mode: "insensitive" } },
              { phone: { contains: q, mode: "insensitive" } },
            ],
          }
        : {}),
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Orders</h1>

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <Link
          href="/admin/orders"
          className={`rounded-full px-3 py-1 text-sm ${!status ? "bg-black text-white" : "bg-white border border-black/10"}`}
        >
          All
        </Link>
        {ALL_STATUSES.map((s) => (
          <Link
            key={s}
            href={`/admin/orders?status=${s}`}
            className={`rounded-full px-3 py-1 text-sm ${status === s ? "bg-black text-white" : "bg-white border border-black/10"}`}
          >
            {s}
          </Link>
        ))}
      </div>

      <form className="mb-4" method="get">
        {status && <input type="hidden" name="status" value={status} />}
        <input
          name="q"
          defaultValue={q}
          placeholder="Search order #, name, or phone..."
          className="w-full max-w-sm rounded-lg border border-black/20 px-3 py-2 text-sm"
        />
      </form>

      <div className="overflow-x-auto rounded-xl border border-black/10 bg-white">
        <table className="w-full min-w-[720px] text-sm">
          <thead className="bg-black/5 text-left">
            <tr>
              <th className="p-3">Order #</th>
              <th className="p-3">Customer</th>
              <th className="p-3">Phone</th>
              <th className="p-3">Placed</th>
              <th className="p-3 text-right">Total</th>
              <th className="p-3">Status</th>
              <th className="p-3"></th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id} className="border-t border-black/5">
                <td className="p-3 font-mono text-xs">{order.orderNumber}</td>
                <td className="p-3 font-medium">{order.customerName}</td>
                <td className="p-3 text-black/60">{order.phone}</td>
                <td className="p-3 text-black/60">{order.createdAt.toLocaleDateString()}</td>
                <td className="p-3 text-right">{formatMoney(toNumber(order.totalAmount.toString()))}</td>
                <td className="p-3">
                  <span className={`rounded-full px-2 py-1 text-xs font-medium ${STATUS_COLORS[order.status]}`}>
                    {order.status}
                  </span>
                </td>
                <td className="p-3 text-right">
                  <Link href={`/admin/orders/${order.id}`} className="text-blue-600 hover:underline">
                    View
                  </Link>
                </td>
              </tr>
            ))}
            {orders.length === 0 && (
              <tr>
                <td colSpan={7} className="p-4 text-center text-black/50">
                  No orders match these filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
