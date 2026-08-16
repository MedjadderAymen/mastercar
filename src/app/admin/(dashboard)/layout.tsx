import Link from "next/link";
import { getAdminSession } from "@/lib/auth";
import { adminLogout } from "@/app/admin/actions";
import AdminNav from "@/components/admin-nav";

export default async function AdminDashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getAdminSession();

  return (
    <div className="flex min-h-screen bg-black/5">
      <aside className="hidden w-64 shrink-0 flex-col border-r border-black/10 bg-white p-4 sm:flex">
        <Link href="/admin" className="mb-6 block text-lg font-bold">
          AutoParts <span className="text-blue-600">Admin</span>
        </Link>
        <AdminNav />
        <div className="mt-auto space-y-2 border-t border-black/10 pt-4 text-sm">
          <div className="text-black/50">Signed in as</div>
          <div className="font-medium">{session?.username}</div>
          <Link href="/" className="block text-blue-600 hover:underline">
            View storefront
          </Link>
          <form action={adminLogout}>
            <button type="submit" className="text-red-600 hover:underline">
              Log out
            </button>
          </form>
        </div>
      </aside>

      <div className="flex-1">
        <header className="flex items-center justify-between border-b border-black/10 bg-white px-4 py-3 sm:hidden">
          <span className="font-bold">AutoParts Admin</span>
          <form action={adminLogout}>
            <button type="submit" className="text-sm text-red-600">
              Log out
            </button>
          </form>
        </header>
        <main className="p-4 sm:p-8">{children}</main>
      </div>
    </div>
  );
}
