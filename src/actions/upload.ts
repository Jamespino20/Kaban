"use server";

export async function uploadIdPicture(formData: FormData) {
  const file = formData.get("file") as File;
  if (!file) return { error: "No file provided" };

  const maxSize = 2 * 1024 * 1024; // 2MB
  if (file.size > maxSize) return { error: "File too large. Max 2MB." };

  try {
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const mimeType = file.type || "image/jpeg";
    const base64Data = buffer.toString("base64");
    const dataUri = `data:${mimeType};base64,${base64Data}`;

    if (dataUri.length > 60000) return { error: "Image too large. Please use a smaller file (under ~50KB)." };

    return { success: true, url: dataUri };
  } catch (error) {
    console.error("Upload error:", error);
    return { error: "Failed to process file" };
  }
}
