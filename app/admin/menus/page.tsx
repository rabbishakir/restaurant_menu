import type { MenuStatus } from "@prisma/client";
import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "../../../lib/prisma";

function formatDate(value: Date): string {
  return new Date(value).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function StatusBadge({ status }: { status: MenuStatus }) {
  const isPublished = status === "PUBLISHED";
  return (
    <span
      className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
        isPublished ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
      }`}
    >
      {status}
    </span>
  );
}

async function createMenuAction() {
  "use server";
  const menu = await prisma.menu.create({
    data: {
      title: "New Menu",
      status: "DRAFT",
    },
  });

  redirect(`/admin/menus/${menu.id}`);
}

export default async function MenusListPage() {
  const menus = await prisma.menu.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-5">
      <section className="rounded-xl bg-brand p-4 text-white sm:p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-semibold">Menus</h2>
            <p className="text-sm text-teal-50">Create and edit your restaurant menus.</p>
          </div>
          <form action={createMenuAction}>
            <button
              type="submit"
              className="rounded-md bg-white px-4 py-2 text-sm font-semibold text-brand transition hover:bg-teal-50"
            >
              Create New Menu
            </button>
          </form>
        </div>
      </section>

      {menus.length === 0 ? (
        <div className="rounded-xl bg-white p-6 text-center text-slate-600 shadow-sm ring-1 ring-slate-200">
          No menus yet. Create your first menu.
        </div>
      ) : (
        <>
          <div className="hidden overflow-x-auto rounded-xl bg-white shadow-sm ring-1 ring-slate-200 md:block">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">
                    Title
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">
                    Created
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-600">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {menus.map((menu) => (
                  <tr key={menu.id}>
                    <td className="px-4 py-3 font-medium text-slate-900">{menu.title}</td>
                    <td className="px-4 py-3">
                      <StatusBadge status={menu.status} />
                    </td>
                    <td className="px-4 py-3 text-slate-600">{formatDate(menu.createdAt)}</td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        href={`/admin/menus/${menu.id}`}
                        className="rounded-md bg-brand px-3 py-2 text-sm font-medium text-white transition hover:bg-brand-dark"
                      >
                        Edit
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="space-y-3 md:hidden">
            {menus.map((menu) => (
              <article
                key={menu.id}
                className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-200"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-semibold text-slate-900">{menu.title}</h3>
                    <p className="mt-1 text-sm text-slate-600">{formatDate(menu.createdAt)}</p>
                  </div>
                  <StatusBadge status={menu.status} />
                </div>
                <div className="mt-4">
                  <Link
                    href={`/admin/menus/${menu.id}`}
                    className="inline-flex rounded-md bg-brand px-3 py-2 text-sm font-medium text-white transition hover:bg-brand-dark"
                  >
                    Edit
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
