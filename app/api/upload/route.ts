import { randomUUID } from "crypto";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { NextResponse } from "next/server";

const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

function getExtension(file: File): string {
  const fromType =
    file.type === "image/jpeg"
      ? "jpg"
      : file.type === "image/png"
        ? "png"
        : file.type === "image/webp"
          ? "webp"
          : "";

  if (fromType) return fromType;

  const fromName = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
  return fromName.replace(/[^a-z0-9]/g, "") || "jpg";
}

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "File is required." }, { status: 400 });
    }

    if (!ALLOWED_TYPES.has(file.type)) {
      return NextResponse.json(
        { error: "Only JPG, PNG, and WEBP files are allowed." },
        { status: 400 },
      );
    }

    const uploadDir = path.join(process.cwd(), "public", "uploads");
    await mkdir(uploadDir, { recursive: true });

    const extension = getExtension(file);
    const filename = `${Date.now()}-${randomUUID()}.${extension}`;
    const targetPath = path.join(uploadDir, filename);
    const bytes = await file.arrayBuffer();

    await writeFile(targetPath, Buffer.from(bytes));

    return NextResponse.json({ path: `/uploads/${filename}` });
  } catch (error) {
    console.error("Upload failed:", error);
    return NextResponse.json({ error: "Upload failed." }, { status: 500 });
  }
}
