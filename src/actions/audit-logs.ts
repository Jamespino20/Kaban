"use server";

import prisma from "@/lib/prisma";
import { requireTanawSession } from "@/lib/authorization";

type AuditFilters = {
  module?: string;
  action_category?: string;
  severity?: string;
  startDate?: string;
  endDate?: string;
  search?: string;
  page?: number;
  pageSize?: number;
  tenantId?: number;
  userId?: number;
};

export async function getAuditLogsPaginated(filters?: AuditFilters) {
  const session = await requireTanawSession();
  const tenantId = filters?.tenantId ?? session.user.tenantId;

  try {
    const page = filters?.page || 1;
    const pageSize = filters?.pageSize || 30;
    const skip = (page - 1) * pageSize;

    const where: any = {};

    if (tenantId) {
      where.tenant_id = tenantId;
    }

    if (filters?.userId) {
      where.user_id = filters.userId;
    }

    if (filters?.module) {
      where.module = filters.module;
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

    if (filters?.search) {
      const searchLower = filters.search.toLowerCase();
      filteredLogs = logs.filter((log) =>
        log.action.toLowerCase().includes(searchLower) ||
        log.entity_type?.toLowerCase().includes(searchLower) ||
        log.user?.username?.toLowerCase().includes(searchLower) ||
        log.actor_label?.toLowerCase().includes(searchLower),
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

export async function getAuditLogStats(tenantId?: number, userId?: number) {
  const session = await requireTanawSession();

  try {
    const where: any = {};
    if (tenantId) where.tenant_id = tenantId;
    if (userId) where.user_id = userId;

    const totalLogs = await prisma.auditLog.count({ where });

    const byCategory = await prisma.auditLog.groupBy({
      by: ["action_category"],
      _count: true,
      where,
    });

    const bySeverity = await prisma.auditLog.groupBy({
      by: ["severity"],
      _count: true,
      where,
    });

    const topActions = await prisma.auditLog.groupBy({
      by: ["action"],
      _count: true,
      take: 20,
      where,
    });

    return {
      success: true,
      stats: { totalLogs, byCategory, bySeverity, topActions },
    };
  } catch (error) {
    console.error("Failed to fetch audit stats:", error);
    return { success: false, error: "Failed to load audit stats" };
  }
}
