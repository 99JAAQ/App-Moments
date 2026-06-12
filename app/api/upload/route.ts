import { NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

let putBlob: ((...args: unknown[]) => Promise<{ url: string }>) | null = null;

async function getBlobPut() {
  if (putBlob === null) {
    try {
      const mod = await import("@vercel/blob");
      putBlob = mod.put as unknown as typeof putBlob;
    } catch {
      putBlob = undefined as unknown as null;
    }
  }
  return putBlob;
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (!file.type.startsWith("image/")) {
      return NextResponse.json({ error: "Only images allowed" }, { status: 400 });
    }

    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: "Max 10MB" }, { status: 400 });
    }

    const ext = file.name.includes(".") ? `.${file.name.split(".").pop()}` : ".jpg";
    const safeName = `fotos/${Date.now()}-${Math.random().toString(36).slice(2, 8)}${ext}`;

    const blobPut = await getBlobPut();

    if (blobPut) {
      const blob = await blobPut(safeName, file, {
        access: "public",
        addRandomSuffix: false,
      });
      return NextResponse.json({ path: blob.url });
    }

    const fotosDir = path.join(process.cwd(), "public", "fotos");
    await mkdir(fotosDir, { recursive: true });
    const filePath = path.join(fotosDir, `${Date.now()}-${Math.random().toString(36).slice(2, 8)}${ext}`);
    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(filePath, buffer);

    return NextResponse.json({ path: `/fotos/${path.basename(filePath)}` });
  } catch {
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
