"use server";

import prisma, { getBranchPrisma } from "@/lib/prisma";
import { requireAdminSession } from "@/lib/authorization";
import { revalidatePath } from "next/cache";

/**
 * Uploads a file as Base64 to the SystemFile table.
 * Used for both user-uploaded documents and system-generated files.
 */
export async function uploadSystemFile({
  fileName,
  contentBase64,
  mimeType,
  size,
  tenantId,
}: {
  fileName: string;
  contentBase64: string;
  mimeType: string;
  size: number;
  tenantId?: number;
}) {
  const session = await requireAdminSession();
  const db = getBranchPrisma(session.user.tenantSlug);

  // If not superadmin, enforce that the file belongs to their branch
  const finalTenantId =
    session.user.role === "superadmin" ? tenantId : session.user.tenantId;

  try {
    const file = await db.systemFile.create({
      data: {
        file_name: fileName,
        content_base64: contentBase64,
        mime_type: mimeType,
        size: size,
        tenant_id: finalTenantId || null,
        uploader_id: session.user.user_id,
      },
    });

    revalidatePath("/agapay-tanaw/files");
    return { success: true, data: file };
  } catch (error) {
    console.error("Failed to upload system file:", error);
    return { success: false, error: "Failed to store file in database." };
  }
}

/**
 * Retrieves a file by ID.
 */
export async function getSystemFile(fileId: string) {
  const session = await requireAdminSession();
  const db = getBranchPrisma(session.user.tenantSlug);

  try {
    const file = await db.systemFile.findUnique({
      where: { id: fileId },
    });

    if (!file) {
      return { success: false, error: "File not found." };
    }

    // Authorization check: Admins can only see their branch files
    if (
      session.user.role !== "superadmin" &&
      file.tenant_id !== session.user.tenantId
    ) {
      return { success: false, error: "Unauthorized access to file." };
    }

    return { success: true, data: file };
  } catch (error) {
    console.error("Failed to retrieve system file:", error);
    return { success: false, error: "Failed to fetch file." };
  }
}

/**
 * Lists files for the current session context.
 */
export async function getSystemFiles(tenantId?: number) {
  const session = await requireAdminSession();
  const db = getBranchPrisma(session.user.tenantSlug);

  try {
    const whereClause: any = {};

    if (session.user.role !== "superadmin") {
      whereClause.tenant_id = session.user.tenantId;
    } else if (tenantId) {
      whereClause.tenant_id = tenantId;
    }

    const files = await db.systemFile.findMany({
      where: whereClause,
      include: {
        uploader: {
          select: { username: true },
        },
        tenant: {
          select: { name: true },
        },
      },
      orderBy: { created_at: "desc" },
    });

    return { success: true, data: files };
  } catch (error) {
    console.error("Failed to list system files:", error);
    return { success: false, error: "Failed to list files." };
  }
}

/**
 * Deletes a system file.
 */
export async function deleteSystemFile(fileId: string) {
  const session = await requireAdminSession();
  const db = getBranchPrisma(session.user.tenantSlug);

  try {
    const file = await db.systemFile.findUnique({
      where: { id: fileId },
    });

    if (!file) {
      return { success: false, error: "File not found." };
    }

    if (
      session.user.role !== "superadmin" &&
      file.tenant_id !== session.user.tenantId
    ) {
      return { success: false, error: "Unauthorized." };
    }

    await db.systemFile.delete({
      where: { id: fileId },
    });

    revalidatePath("/agapay-tanaw/files");
    return { success: true };
  } catch (error) {
    console.error("Failed to delete system file:", error);
    return { success: false, error: "Failed to delete file." };
  }
}
