import { NextResponse } from "next/server";
import { prisma } from "../../../../../../lib/prisma";

type Params = {
  params: {
    id: string;
    itemId: string;
  };
};

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
