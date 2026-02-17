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
  contentTopOffset?: number;
  contentWidth?: number;
  overlayOpacity?: number;
  zelleImagePath?: string | null;
  zelleX?: number;
  zelleY?: number;
  zelleWidth?: number;
  contactImagePath?: string | null;
  contactX?: number;
  contactY?: number;
  contactWidth?: number;
};

export async function PATCH(req: Request, { params }: Params) {
  try {
    const body = (await req.json()) as UpdateMenuBody;
    const title = body.title?.trim();
    const status = body.status;
    const backgroundImagePath = body.backgroundImagePath;
    const titleFontSize = body.titleFontSize;
    const itemFontSize = body.itemFontSize;
    const contentTopOffset = body.contentTopOffset;
    const contentWidth = body.contentWidth;
    const overlayOpacity = body.overlayOpacity;
    const zelleImagePath = body.zelleImagePath;
    const zelleX = body.zelleX;
    const zelleY = body.zelleY;
    const zelleWidth = body.zelleWidth;
    const contactImagePath = body.contactImagePath;
    const contactX = body.contactX;
    const contactY = body.contactY;
    const contactWidth = body.contactWidth;

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
    if (zelleImagePath !== undefined && zelleImagePath !== null && !zelleImagePath.startsWith("/uploads/")) {
      return NextResponse.json(
        { success: false, error: "Invalid zelle image path." },
        { status: 400 },
      );
    }
    if (
      contactImagePath !== undefined &&
      contactImagePath !== null &&
      !contactImagePath.startsWith("/uploads/")
    ) {
      return NextResponse.json(
        { success: false, error: "Invalid contact image path." },
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

    if (contentTopOffset !== undefined && (contentTopOffset < 0 || contentTopOffset > 500)) {
      return NextResponse.json(
        { success: false, error: "Vertical position must be between 0 and 500." },
        { status: 400 },
      );
    }

    if (contentWidth !== undefined && (contentWidth < 300 || contentWidth > 900)) {
      return NextResponse.json(
        { success: false, error: "Content width must be between 300 and 900." },
        { status: 400 },
      );
    }

    if (overlayOpacity !== undefined && (overlayOpacity < 0 || overlayOpacity > 80)) {
      return NextResponse.json(
        { success: false, error: "Overlay opacity must be between 0 and 80." },
        { status: 400 },
      );
    }
    if (zelleX !== undefined && (zelleX < 0 || zelleX > 2000)) {
      return NextResponse.json(
        { success: false, error: "Invalid zelle X position." },
        { status: 400 },
      );
    }
    if (zelleY !== undefined && (zelleY < 0 || zelleY > 2000)) {
      return NextResponse.json(
        { success: false, error: "Invalid zelle Y position." },
        { status: 400 },
      );
    }
    if (zelleWidth !== undefined && (zelleWidth < 40 || zelleWidth > 600)) {
      return NextResponse.json(
        { success: false, error: "Invalid zelle width." },
        { status: 400 },
      );
    }
    if (contactX !== undefined && (contactX < 0 || contactX > 2000)) {
      return NextResponse.json(
        { success: false, error: "Invalid contact X position." },
        { status: 400 },
      );
    }
    if (contactY !== undefined && (contactY < 0 || contactY > 2000)) {
      return NextResponse.json(
        { success: false, error: "Invalid contact Y position." },
        { status: 400 },
      );
    }
    if (contactWidth !== undefined && (contactWidth < 40 || contactWidth > 600)) {
      return NextResponse.json(
        { success: false, error: "Invalid contact width." },
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
        ...(contentTopOffset !== undefined ? { contentTopOffset } : {}),
        ...(contentWidth !== undefined ? { contentWidth } : {}),
        ...(overlayOpacity !== undefined ? { overlayOpacity } : {}),
        ...(zelleImagePath !== undefined ? { zelleImagePath } : {}),
        ...(zelleX !== undefined ? { zelleX } : {}),
        ...(zelleY !== undefined ? { zelleY } : {}),
        ...(zelleWidth !== undefined ? { zelleWidth } : {}),
        ...(contactImagePath !== undefined ? { contactImagePath } : {}),
        ...(contactX !== undefined ? { contactX } : {}),
        ...(contactY !== undefined ? { contactY } : {}),
        ...(contactWidth !== undefined ? { contactWidth } : {}),
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
