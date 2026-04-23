import { NextRequest, NextResponse } from "next/server";
import { requireSuperadminSession } from "@/lib/authorization";
import prisma from "@/lib/prisma";
import fs from "fs/promises";
import path from "path";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await requireSuperadminSession();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const backup = await prisma.decommissionedBackup.findUnique({
    where: { id },
  });

  if (!backup) {
    return NextResponse.json({ error: "Backup not found" }, { status: 404 });
  }

  try {
    const resolvedPath = path.resolve(backup.file_url);
    const fileBuffer = await fs.readFile(resolvedPath);

    return new NextResponse(fileBuffer as any, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="${path.basename(resolvedPath)}"`,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Backup file is unavailable" },
      { status: 404 },
    );
  }
}
