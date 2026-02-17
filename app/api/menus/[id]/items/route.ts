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
};

export async function POST(req: Request, { params }: Params) {
  try {
    const body = (await req.json()) as AddItemBody;
    const name = body.name?.trim();
    const price = body.price?.trim();

    if (!name || !price) {
      return NextResponse.json(
        { success: false, error: "Name and price are required." },
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
        price,
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
