import { notFound } from "next/navigation";
import MenuEditor from "../../../../components/admin/MenuEditor";
import { prisma } from "../../../../lib/prisma";

type Props = { params: { id: string } };

export default async function MenuEditPage({ params }: Props) {
  const menu = await prisma.menu.findUnique({
    where: { id: params.id },
    include: {
      menuItems: {
        orderBy: { position: "asc" },
      },
    },
  });

  if (!menu) {
    notFound();
  }

  return (
    <div className="space-y-4">
      <section className="rounded-xl bg-brand p-4 text-white sm:p-5">
        <h2 className="text-xl font-semibold">Edit Menu</h2>
        <p className="text-sm text-teal-50">Menu ID: {menu.id}</p>
      </section>

      <MenuEditor
        menu={{ id: menu.id, title: menu.title, status: menu.status }}
        initialItems={menu.menuItems}
      />
    </div>
  );
}
