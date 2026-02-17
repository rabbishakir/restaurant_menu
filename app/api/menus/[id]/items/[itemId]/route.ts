import { NextResponse } from "next/server";
import { prisma } from "../../../../../../lib/prisma";

type Params = {
  params: {
    id: string;
    itemId: string;
  };
};

type UpdateItemBody = {
  name?: string;
  price?: string | null;
};

export async function PATCH(req: Request, { params }: Params) {
  try {
    const body = (await req.json()) as UpdateItemBody;
    const nextName = body.name?.trim();
    const nextPrice = typeof body.price === "string" ? body.price.trim() : body.price;

    if (!nextName) {
      return NextResponse.json(
        { success: false, error: "Name is required." },
        { status: 400 },
      );
    }

    const existing = await prisma.menuItem.findFirst({
      where: {
        id: params.itemId,
        menuId: params.id,
      },
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, error: "Item not found." },
        { status: 404 },
      );
    }

    if (existing.type === "ITEM" && (!nextPrice || nextPrice.length === 0)) {
      return NextResponse.json(
        { success: false, error: "Price is required for item type." },
        { status: 400 },
      );
    }

    const updated = await prisma.menuItem.update({
      where: { id: params.itemId },
      data: {
        name: nextName,
        price: existing.type === "CATEGORY" ? null : nextPrice,
      },
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error("Failed to update item:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update item." },
      { status: 500 },
    );
  }
}

export async function DELETE(_req: Request, { params }: Params) {
  try {
    await prisma.menuItem.delete({
      where: {
        id: params.itemId,
        menuId: params.id,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete item:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete item." },
      { status: 500 },
    );
  }
}
