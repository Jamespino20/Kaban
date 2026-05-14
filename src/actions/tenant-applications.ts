"use server";

import prisma from "@/lib/prisma";
import { requireSuperadminSession } from "@/lib/authorization";

// Get tenant applications with filtering
export async function getTenantApplicationsFiltered(filters?: {
  status?: "pending" | "approved" | "rejected";
  region?: string;
  search?: string;
}) {
  const session = await requireSuperadminSession();
  
  try {
    const where: any = {};
    
    if (filters?.status) {
      where.status = filters.status;
    }
    
    if (filters?.region) {
      where.tenant_group = {
        name: { contains: filters.region, mode: "insensitive" }
      };
    }
    
    const applications = await prisma.tenantApplication.findMany({
      where,
      orderBy: { created_at: "desc" }
    });
    
    let filtered = applications;
    
    // Apply search filter in memory
    if (filters?.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = applications.filter((app: any) =>
        app.tenant_name.toLowerCase().includes(searchLower) ||
        app.applicant_name?.toLowerCase().includes(searchLower) ||
        app.applicant_email?.toLowerCase().includes(searchLower)
      );
    }
    
    return { success: true, data: filtered };
  } catch (error) {
    console.error("Failed to fetch filtered applications:", error);
    return { success: false, data: [], error: "Failed to load applications" };
  }
}

// Get pending count
export async function getPendingApplicationsCount() {
  await requireSuperadminSession();
  
  try {
    const count = await prisma.tenantApplication.count({
      where: { status: "pending" }
    });
    
    return { success: true, count };
  } catch (error) {
    console.error("Failed to count:", error);
    return { success: false, count: 0 };
  }
}

// Process application (approve/reject)
export async function processApplication(
  applicationId: number,
  action: "approve" | "reject",
  reason?: string
) {
  const session = await requireSuperadminSession();
  
  try {
    const result = await prisma.$transaction(async (tx: any) => {
      const app = await tx.tenantApplication.findUnique({
        where: { application_id: applicationId }
      });
      
      if (!app) throw new Error(`Tenant application not found: ${applicationId}.`);
      
      const newStatus = action === "approve" ? "approved" : "rejected";
      
      const updated = await tx.tenantApplication.update({
        where: { application_id: applicationId },
        data: {
          status: newStatus,
          reviewed_by: session.user.user_id,
          reviewed_at: new Date(),
          review_notes: reason || null
        }
      });
      
      // Create tenant if approved
      if (action === "approve") {
        await tx.tenant.create({
          data: {
            name: app.tenant_name,
            slug: app.tenant_slug,
            tenant_group_id: app.tenant_group_id,
            entitlement_status: "prospect",
            brand_color: app.brand_color,
            accent_color: app.accent_color,
            logo_url: app.logo_url
          }
        });
      }
      
      // Audit log
      await tx.auditLog.create({
        data: {
          action: `TENANT_APPLICATION_${action.toUpperCase()}`,
          entity_type: "TenantApplication",
          entity_id: applicationId,
          user_id: session.user.user_id,
          new_values: { status: newStatus, reason } as any
        }
      });
      
      return updated;
    });
    
    return { success: true, data: result };
  } catch (error) {
    console.error("Failed to process:", error);
    return { success: false, error: "Failed to process" };
  }
}