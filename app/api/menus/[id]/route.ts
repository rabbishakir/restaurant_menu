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
  backgroundImagePath?: string | null;
  titleFontSize?: number;
  itemFontSize?: number;
};

export async function PATCH(req: Request, { params }: Params) {
  try {
    const body = (await req.json()) as UpdateMenuBody;
    const title = body.title?.trim();
    const status = body.status;
    const backgroundImagePath = body.backgroundImagePath;
    const titleFontSize = body.titleFontSize;
    const itemFontSize = body.itemFontSize;

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

    if (
      backgroundImagePath !== undefined &&
      backgroundImagePath !== null &&
      !backgroundImagePath.startsWith("/uploads/")
    ) {
      return NextResponse.json(
        { success: false, error: "Invalid background image path." },
        { status: 400 },
      );
    }

    if (titleFontSize !== undefined && (titleFontSize < 24 || titleFontSize > 80)) {
      return NextResponse.json(
        { success: false, error: "Title font size must be between 24 and 80." },
        { status: 400 },
      );
    }

    if (itemFontSize !== undefined && (itemFontSize < 12 || itemFontSize > 40)) {
      return NextResponse.json(
        { success: false, error: "Item font size must be between 12 and 40." },
        { status: 400 },
      );
    }

    const updated = await prisma.menu.update({
      where: { id: params.id },
      data: {
        ...(title !== undefined ? { title } : {}),
        ...(status !== undefined ? { status } : {}),
        ...(backgroundImagePath !== undefined ? { backgroundImagePath } : {}),
        ...(titleFontSize !== undefined ? { titleFontSize } : {}),
        ...(itemFontSize !== undefined ? { itemFontSize } : {}),
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
