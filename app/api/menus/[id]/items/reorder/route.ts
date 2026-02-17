import { NextResponse } from "next/server";
import { prisma } from "../../../../../../lib/prisma";

type Params = {
  params: {
    id: string;
  };
};

type ReorderBody = {
  itemId?: string;
  direction?: "up" | "down";
};

export async function PATCH(req: Request, { params }: Params) {
  try {
    const body = (await req.json()) as ReorderBody;
    const itemId = body.itemId;
    const direction = body.direction;

    if (!itemId || (direction !== "up" && direction !== "down")) {
      return NextResponse.json(
        { success: false, error: "itemId and direction are required." },
        { status: 400 },
      );
    }

    const items = await prisma.menuItem.findMany({
      where: { menuId: params.id },
      orderBy: { position: "asc" },
    });

    const index = items.findIndex((item) => item.id === itemId);
    if (index === -1) {
      return NextResponse.json({ success: false, error: "Item not found." }, { status: 404 });
    }

    const neighborIndex = direction === "up" ? index - 1 : index + 1;
    if (neighborIndex < 0 || neighborIndex >= items.length) {
      return NextResponse.json(
        { success: false, error: "Cannot move item further." },
        { status: 400 },
      );
    }

    const current = items[index];
    const neighbor = items[neighborIndex];

    await prisma.$transaction([
      prisma.menuItem.update({
        where: { id: current.id },
        data: { position: neighbor.position },
      }),
      prisma.menuItem.update({
        where: { id: neighbor.id },
        data: { position: current.position },
      }),
    ]);

    const updatedItems = await prisma.menuItem.findMany({
      where: { menuId: params.id },
      orderBy: { position: "asc" },
    });

    return NextResponse.json({ success: true, data: updatedItems });
  } catch (error) {
    console.error("Failed to reorder item:", error);
    return NextResponse.json(
      { success: false, error: "Failed to reorder item." },
      { status: 500 },
    );
  }
}
