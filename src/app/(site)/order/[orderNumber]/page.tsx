import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { formatMoney, toNumber } from "@/lib/format";

export const dynamic = "force-dynamic";

const STATUS_LABELS: Record<string, string> = {
  SUBMITTED: "Submitted",
  CONFIRMED: "Confirmed",
  PROCESSING: "Processing",
  SHIPPED: "Shipped",
  DELIVERED: "Delivered",
  CANCELED: "Canceled",
};

export default async function OrderConfirmationPage({
  params,
}: {
  params: Promise<{ orderNumber: string }>;
}) {
  const { orderNumber } = await params;

  const order = await prisma.order.findUnique({
    where: { orderNumber },
    include: { items: true },
  });

  if (!order) notFound();

  return (
    <div className="mx-auto max-w-xl text-center">
      <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-green-100 text-2xl text-green-600">
        ✓
      </div>
      <h1 className="text-2xl font-bold">Order placed!</h1>
      <p className="mt-2 text-black/60">
        Thanks, {order.customerName}. We&rsquo;ll contact you at {order.phone} to confirm delivery.
      </p>

      <div className="mt-6 rounded-xl border border-black/10 bg-white p-6 text-left">
        <div className="flex items-center justify-between">
          <span className="text-sm text-black/50">Order number</span>
          <span className="font-mono font-semibold">{order.orderNumber}</span>
        </div>
        <div className="mt-2 flex items-center justify-between">
          <span className="text-sm text-black/50">Status</span>
          <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
            {STATUS_LABELS[order.status]}
          </span>
        </div>

        <div className="mt-4 space-y-2 border-t border-black/10 pt-4">
          {order.items.map((item) => (
            <div key={item.id} className="flex justify-between text-sm">
              <span>
                {item.nameSnapshot} × {item.quantity}
              </span>
              <span>{formatMoney(toNumber(item.unitPrice.toString()) * item.quantity)}</span>
            </div>
          ))}
        </div>

        <div className="mt-4 flex justify-between border-t border-black/10 pt-4 font-bold">
          <span>Total (cash on delivery)</span>
          <span>{formatMoney(toNumber(order.totalAmount.toString()))}</span>
        </div>

        <div className="mt-4 border-t border-black/10 pt-4 text-sm text-black/60">
          <div>Delivering to: {order.address}, {order.city}</div>
        </div>
      </div>

      <Link href="/" className="mt-6 inline-block rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white">
        Continue shopping
      </Link>
    </div>
  );
}
