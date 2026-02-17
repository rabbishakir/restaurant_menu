import { NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";

export async function GET() {
  try {
    const menus = await prisma.menu.findMany({
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, data: menus });
  } catch (error) {
    console.error("Failed to fetch menus:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch menus" },
      { status: 500 },
    );
  }
}

export async function POST() {
  try {
    const menu = await prisma.menu.create({
      data: {
        title: "New Menu",
        status: "DRAFT",
      },
    });

    return NextResponse.json({ success: true, data: menu }, { status: 201 });
  } catch (error) {
    console.error("Failed to create menu:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create menu" },
      { status: 500 },
    );
  }
}
