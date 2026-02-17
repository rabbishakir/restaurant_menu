import { NextResponse } from "next/server";
import { prisma } from "../../../../../lib/prisma";

type Params = {
  params: {
    id: string;
  };
};

type AddItemBody = {
  name?: string;
  price?: string;
  type?: "ITEM" | "CATEGORY";
};

export async function POST(req: Request, { params }: Params) {
  try {
    const body = (await req.json()) as AddItemBody;
    const name = body.name?.trim();
    const price = body.price?.trim();
    const type = body.type === "CATEGORY" ? "CATEGORY" : "ITEM";

    if (!name) {
      return NextResponse.json(
        { success: false, error: "Name is required." },
        { status: 400 },
      );
    }

    if (type === "ITEM" && !price) {
      return NextResponse.json(
        { success: false, error: "Price is required for item type." },
        { status: 400 },
      );
    }

    const maxPosition = await prisma.menuItem.aggregate({
      where: { menuId: params.id },
      _max: { position: true },
    });

    const item = await prisma.menuItem.create({
      data: {
        menuId: params.id,
        name,
        price: type === "CATEGORY" ? null : price,
        type,
        position: (maxPosition._max.position ?? -1) + 1,
      },
    });

    return NextResponse.json({ success: true, data: item }, { status: 201 });
  } catch (error) {
    console.error("Failed to add item:", error);
    return NextResponse.json(
      { success: false, error: "Failed to add item." },
      { status: 500 },
    );
  }
}
