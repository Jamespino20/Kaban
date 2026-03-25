"use server";

import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { v4 as uuidv4 } from "uuid";

export async function uploadIdPicture(formData: FormData) {
  const file = formData.get("file") as File;
  if (!file) {
    return { error: "No file provided" };
  }

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  const uploadDir = join(process.cwd(), "public/uploads/ids");

  try {
    await mkdir(uploadDir, { recursive: true });

    const filename = `${uuidv4()}-${file.name}`;
    const path = join(uploadDir, filename);
    await writeFile(path, buffer);

    return { success: true, url: `/uploads/ids/${filename}` };
  } catch (error) {
    console.error("Upload error:", error);
    return { error: "Failed to upload file" };
  }
}
