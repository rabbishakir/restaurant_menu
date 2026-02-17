import type { ReactNode } from "react";
import Link from "next/link";
import LogoutButton from "../../components/LogoutButton";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="space-y-6">
      <section className="rounded-xl bg-brand p-4 text-white shadow-sm sm:p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-xl font-semibold">Admin Panel</h1>
            <p className="text-sm text-teal-50">Manage your restaurant menu content.</p>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/admin"
              className="rounded-md border border-teal-300 px-3 py-2 text-sm font-medium hover:bg-teal-700"
            >
              Dashboard
            </Link>
            <LogoutButton />
          </div>
        </div>
      </section>

      <section className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-200 sm:p-6">
        {children}
      </section>
    </div>
  );
}
