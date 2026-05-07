"use server";

import prisma from "@/lib/prisma";
import { requireSuperadminSession } from "@/lib/authorization";

// Get cross-tenant audit logs with filtering
export async function getCrossTenantAuditLogs(filters?: {
  module?: string;
  action_category?: string;
  severity?: string;
  startDate?: string;
  endDate?: string;
  search?: string;
  page?: number;
  pageSize?: number;
}) {
  const session = await requireSuperadminSession();
  
  try {
    const page = filters?.page || 1;
    const pageSize = filters?.pageSize || 50;
    const skip = (page - 1) * pageSize;
    
    const where: any = {};
    
    if (filters?.module) {
      where.module = filters.module;
    }
    
    if (filters?.action_category) {
      where.action_category = filters.action_category;
    }
    
    if (filters?.severity) {
      where.severity = filters.severity;
    }
    
    if (filters?.startDate || filters?.endDate) {
      where.created_at = {};
      if (filters?.startDate) {
        where.created_at.gte = new Date(filters.startDate);
      }
      if (filters?.endDate) {
        where.created_at.lte = new Date(filters.endDate + "T23:59:59");
      }
    }
    
    const [logs, total] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        include: {
          tenant: { select: { name: true } },
          user: { select: { username: true, email: true } },
        },
        orderBy: { created_at: "desc" },
        skip,
        take: pageSize,
      }),
      prisma.auditLog.count({ where }),
    ]);
    
    let filteredLogs = logs;
    
    // Apply search filter in memory
    if (filters?.search) {
      const searchLower = filters.search.toLowerCase();
      filteredLogs = logs.filter(log =>
        log.action.toLowerCase().includes(searchLower) ||
        log.entity_type?.toLowerCase().includes(searchLower) ||
        log.user?.username?.toLowerCase().includes(searchLower) ||
        log.actor_label?.toLowerCase().includes(searchLower)
      );
    }
    
    return {
      success: true,
      data: filteredLogs,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    };
  } catch (error) {
    console.error("Failed to fetch audit logs:", error);
    return { success: false, error: "Failed to load audit logs" };
  }
}

// Get audit log statistics
export async function getAuditLogStats() {
  const session = await requireSuperadminSession();
  
  try {
    const totalLogs = await prisma.auditLog.count();
    
    const byCategory = await prisma.auditLog.groupBy({
      by: ["action_category"],
      _count: true,
    });
    
    const bySeverity = await prisma.auditLog.groupBy({
      by: ["severity"],
      _count: true,
    });
    
    const topActions = await prisma.auditLog.groupBy({
      by: ["action"],
      _count: true,
      take: 20,
    });
    
    const allTenants = await prisma.tenant.findMany({
      select: { tenant_id: true, name: true },
    });
    
    const byTenant = await Promise.all(
      allTenants.map(async (t) => {
        const count = await prisma.auditLog.count({
          where: { tenant_id: t.tenant_id },
        });
        return { tenant_id: t.tenant_id, name: t.name, count };
      })
    );
    
    const allUsers = await prisma.user.findMany({
      select: { user_id: true, username: true },
      take: 10,
    });
    
    const topUsers = await Promise.all(
      allUsers.map(async (u) => {
        const count = await prisma.auditLog.count({
          where: { user_id: u.user_id },
        });
        return { user_id: u.user_id, username: u.username, count };
      })
    );
    
    byTenant.sort((a, b) => b.count - a.count);
    topUsers.sort((a, b) => b.count - a.count);
    
    return {
      success: true,
      stats: {
        totalLogs,
        byCategory,
        bySeverity,
        byTenant: byTenant.slice(0, 10),
        topUsers: topUsers.slice(0, 10),
        topActions,
      },
    };
  } catch (error) {
    console.error("Failed to fetch audit stats:", error);
    return { success: false, error: "Failed to load audit stats" };
  }
}