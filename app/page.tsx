import Link from "next/link";

export default function Home() {
  return (
    <section className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-slate-200 sm:p-8">
      <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">Welcome to Menu Builder</h1>
      <p className="mt-3 max-w-2xl text-slate-600">
        Build, organize, and publish your restaurant menus from a simple admin panel.
      </p>
      <div className="mt-6 flex flex-wrap gap-3">
        <Link
          href="/login"
          className="rounded-md bg-brand px-4 py-2 font-medium text-white transition hover:bg-brand-dark"
        >
          Go to Login
        </Link>
        <Link
          href="/admin"
          className="rounded-md border border-slate-300 bg-white px-4 py-2 font-medium text-slate-800 transition hover:bg-slate-50"
        >
          Open Admin
        </Link>
      </div>
    </section>
  );
}
