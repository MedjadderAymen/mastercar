import Link from "next/link";
import { prisma } from "@/lib/db";
import { formatMoney, toNumber } from "@/lib/format";

export const dynamic = "force-dynamic";

const STATUS_ORDER = ["SUBMITTED", "CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELED"] as const;

export default async function AdminDashboardPage() {
  const [statusCounts, accessories, lowStock, recentOrders] = await Promise.all([
    prisma.order.groupBy({ by: ["status"], _count: { _all: true } }),
    prisma.accessory.findMany({ where: { isActive: true } }),
    prisma.accessory.findMany({
      where: { isActive: true, quantity: { lte: 5 } },
      orderBy: { quantity: "asc" },
      take: 8,
      include: { model: { include: { brand: true } } },
    }),
    prisma.order.findMany({ orderBy: { createdAt: "desc" }, take: 6 }),
  ]);

  const countsByStatus = Object.fromEntries(statusCounts.map((s) => [s.status, s._count._all]));
  const totalInventoryValue = accessories.reduce(
    (sum, a) => sum + toNumber(a.sellPrice.toString()) * a.quantity,
    0
  );
  const totalPotentialProfit = accessories.reduce(
    (sum, a) => sum + (toNumber(a.sellPrice.toString()) - toNumber(a.buyPrice.toString())) * a.quantity,
    0
  );

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Dashboard</h1>

      <div className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatCard label="Total accessories" value={accessories.length.toString()} />
        <StatCard label="Inventory value (sell)" value={formatMoney(totalInventoryValue)} />
        <StatCard label="Potential profit" value={formatMoney(totalPotentialProfit)} />
        <StatCard label="Low stock items" value={lowStock.length.toString()} accent={lowStock.length > 0} />
      </div>

      <div className="mb-8">
        <h2 className="mb-3 text-lg font-semibold">Orders by status</h2>
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
          {STATUS_ORDER.map((status) => (
            <Link
              key={status}
              href={`/admin/orders?status=${status}`}
              className="rounded-xl border border-black/10 bg-white p-4 text-center transition hover:shadow-md"
            >
              <div className="text-2xl font-bold">{countsByStatus[status] ?? 0}</div>
              <div className="mt-1 text-xs text-black/50">{status}</div>
            </Link>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <div>
          <h2 className="mb-3 text-lg font-semibold">Low stock alerts</h2>
          <div className="overflow-hidden rounded-xl border border-black/10 bg-white">
            {lowStock.length === 0 ? (
              <p className="p-4 text-sm text-black/50">Nothing low on stock.</p>
            ) : (
              <table className="w-full text-sm">
                <tbody>
                  {lowStock.map((acc) => (
                    <tr key={acc.id} className="border-b border-black/5 last:border-0">
                      <td className="p-3">
                        <div className="font-medium">{acc.name}</div>
                        <div className="text-xs text-black/50">
                          {acc.model.brand.name} {acc.model.name}
                        </div>
                      </td>
                      <td className="p-3 text-right font-semibold text-red-600">{acc.quantity} left</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        <div>
          <h2 className="mb-3 text-lg font-semibold">Recent orders</h2>
          <div className="overflow-hidden rounded-xl border border-black/10 bg-white">
            {recentOrders.length === 0 ? (
              <p className="p-4 text-sm text-black/50">No orders yet.</p>
            ) : (
              <table className="w-full text-sm">
                <tbody>
                  {recentOrders.map((order) => (
                    <tr key={order.id} className="border-b border-black/5 last:border-0">
                      <td className="p-3">
                        <Link href={`/admin/orders/${order.id}`} className="font-mono text-blue-700 hover:underline">
                          {order.orderNumber}
                        </Link>
                        <div className="text-xs text-black/50">{order.customerName}</div>
                      </td>
                      <td className="p-3 text-right">{formatMoney(toNumber(order.totalAmount.toString()))}</td>
                      <td className="p-3 text-right text-xs text-black/50">{order.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="rounded-xl border border-black/10 bg-white p-4">
      <div className={`text-2xl font-bold ${accent ? "text-red-600" : ""}`}>{value}</div>
      <div className="mt-1 text-xs text-black/50">{label}</div>
    </div>
  );
}
