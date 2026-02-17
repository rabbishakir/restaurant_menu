import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";

type Params = {
  params: {
    id: string;
  };
};

type UpdateMenuBody = {
  title?: string;
  status?: "DRAFT" | "PUBLISHED";
};

export async function PATCH(req: Request, { params }: Params) {
  try {
    const body = (await req.json()) as UpdateMenuBody;
    const title = body.title?.trim();
    const status = body.status;

    if (title !== undefined && title.length === 0) {
      return NextResponse.json(
        { success: false, error: "Title cannot be empty." },
        { status: 400 },
      );
    }

    if (status !== undefined && status !== "DRAFT" && status !== "PUBLISHED") {
      return NextResponse.json(
        { success: false, error: "Invalid status value." },
        { status: 400 },
      );
    }

    const updated = await prisma.menu.update({
      where: { id: params.id },
      data: {
        ...(title !== undefined ? { title } : {}),
        ...(status !== undefined ? { status } : {}),
      },
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error("Failed to update menu:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update menu." },
      { status: 500 },
    );
  }
}
