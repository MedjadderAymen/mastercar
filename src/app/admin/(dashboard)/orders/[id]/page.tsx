import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { formatMoney, toNumber } from "@/lib/format";
import { updateOrderStatus } from "../actions";

export const dynamic = "force-dynamic";

const STATUSES = ["SUBMITTED", "CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELED"];

export default async function AdminOrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const order = await prisma.order.findUnique({
    where: { id },
    include: { items: true },
  });
  if (!order) notFound();

  const updateStatusWithId = updateOrderStatus.bind(null, order.id);

  return (
    <div className="mx-auto max-w-2xl">
      <nav className="mb-4 text-sm text-black/50">
        <Link href="/admin/orders" className="hover:text-blue-600">
          Orders
        </Link>{" "}
        / <span className="text-black">{order.orderNumber}</span>
      </nav>

      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">{order.orderNumber}</h1>
        <span className="text-xs text-black/50">Placed {order.createdAt.toLocaleString()}</span>
      </div>

      <div className="mb-6 grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div className="rounded-xl border border-black/10 bg-white p-4">
          <h2 className="mb-3 font-semibold">Customer</h2>
          <dl className="space-y-1 text-sm">
            <div className="flex justify-between">
              <dt className="text-black/50">Name</dt>
              <dd>{order.customerName}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-black/50">Phone</dt>
              <dd>{order.phone}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-black/50">City</dt>
              <dd>{order.city}</dd>
            </div>
            <div>
              <dt className="text-black/50">Address</dt>
              <dd>{order.address}</dd>
            </div>
            {order.notes && (
              <div>
                <dt className="text-black/50">Notes</dt>
                <dd>{order.notes}</dd>
              </div>
            )}
          </dl>
        </div>

        <div className="rounded-xl border border-black/10 bg-white p-4">
          <h2 className="mb-3 font-semibold">Update status</h2>
          <form action={updateStatusWithId} className="space-y-3">
            <select name="status" defaultValue={order.status} className="w-full rounded-lg border border-black/20 px-3 py-2">
              {STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
            <button type="submit" className="w-full rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-700">
              Save status
            </button>
          </form>
          <p className="mt-3 text-xs text-black/40">
            Canceling automatically restocks these items; reactivating deducts them again.
          </p>
        </div>
      </div>

      <h2 className="mb-3 font-semibold">Items</h2>
      <div className="overflow-hidden rounded-xl border border-black/10 bg-white">
        <table className="w-full text-sm">
          <thead className="bg-black/5 text-left">
            <tr>
              <th className="p-3">Item</th>
              <th className="p-3 text-right">Unit price</th>
              <th className="p-3 text-right">Qty</th>
              <th className="p-3 text-right">Subtotal</th>
            </tr>
          </thead>
          <tbody>
            {order.items.map((item) => (
              <tr key={item.id} className="border-t border-black/5">
                <td className="p-3">{item.nameSnapshot}</td>
                <td className="p-3 text-right">{formatMoney(toNumber(item.unitPrice.toString()))}</td>
                <td className="p-3 text-right">{item.quantity}</td>
                <td className="p-3 text-right">{formatMoney(toNumber(item.unitPrice.toString()) * item.quantity)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t border-black/10 font-bold">
              <td className="p-3" colSpan={3}>
                Total (cash on delivery)
              </td>
              <td className="p-3 text-right">{formatMoney(toNumber(order.totalAmount.toString()))}</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
