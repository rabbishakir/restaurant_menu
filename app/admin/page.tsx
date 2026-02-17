import Link from "next/link";

export default function AdminPage() {
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold text-slate-900">Admin Dashboard</h2>
      <p className="rounded-lg bg-teal-50 p-4 text-slate-700">
        You are signed in. Menu management UI is next.
      </p>
      <div>
        <Link
          href="/admin/menus"
          className="inline-flex rounded-md bg-brand px-4 py-2 font-medium text-white transition hover:bg-brand-dark"
        >
          Manage Menus
        </Link>
      </div>
    </div>
  );
}
