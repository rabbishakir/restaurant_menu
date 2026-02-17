import Link from "next/link";
import { redirect } from "next/navigation";
import LogoutButton from "../../components/LogoutButton";
import { prisma } from "../../lib/prisma";

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

export default async function DashboardPage() {
  const menus = await prisma.menu.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="min-h-screen bg-slate-100">
      <header className="border-b border-slate-200 bg-white">
        <div className="flex h-14 items-center justify-between px-6">
          <h1 className="text-lg font-semibold text-slate-900">Restaurant Menu Builder</h1>
          <LogoutButton />
        </div>
      </header>

      <main className="space-y-6 px-6 py-6">
        <form action={createMenuAction}>
          <button
            type="submit"
            className="rounded-lg bg-brand px-6 py-3 text-lg font-semibold text-white transition hover:bg-brand-dark"
          >
            + Add New Menu
          </button>
        </form>

        {menus.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center text-slate-600">
            No menus yet.
          </div>
        ) : (
          <div className="grid gap-6 [grid-template-columns:repeat(5,minmax(220px,220px))] justify-start">
            {menus.map((menu) => (
              <article
                key={menu.id}
                className="relative overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-slate-200 transition hover:shadow-md"
              >
                <div
                  className="relative h-40 w-full bg-slate-200"
                  style={{
                    backgroundImage: menu.backgroundImagePath
                      ? `linear-gradient(to top, rgba(15, 23, 42, 0.85), rgba(15, 23, 42, 0.25)), url(${menu.backgroundImagePath})`
                      : "linear-gradient(to top, rgba(15, 23, 42, 0.8), rgba(15, 23, 42, 0.35))",
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                  }}
                >
                  <div className="absolute inset-0 flex items-end p-3">
                    <div className="min-w-0">
                      <h3 className="truncate text-sm font-semibold text-white">{menu.title}</h3>
                      <span
                        className={`mt-1 inline-flex rounded-full px-2 py-1 text-[10px] font-semibold ${
                          menu.status === "PUBLISHED"
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-amber-100 text-amber-700"
                        }`}
                      >
                        {menu.status}
                      </span>
                    </div>
                  </div>
                  <Link
                    href={`/admin/menus/${menu.id}`}
                    className="absolute right-3 top-3 inline-flex h-8 items-center justify-center rounded-full bg-brand px-3 text-xs font-semibold text-white transition hover:bg-brand-dark"
                    aria-label={`Edit ${menu.title}`}
                  >
                    Edit
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
