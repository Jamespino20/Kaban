"use server";

import prisma from "@/lib/prisma";
import { requireAuthenticatedSession } from "@/lib/authorization";
import { subDays, startOfDay, format } from "date-fns";

export interface AnalyticsData {
  trafficTrends: { date: string; count: number }[];
  interactionHeatmap: { type: string; count: number }[];
  geoData: { region: string; city: string; count: number }[];
  activeUserDensity: { userId: number | null; count: number }[];
}

export async function getTenantAnalytics(
  days: number = 7,
): Promise<AnalyticsData | null> {
  const session = await requireAuthenticatedSession();
  const tenantId = session.user.tenantId || null;
  const startDate = startOfDay(subDays(new Date(), days));

  try {
    // 1. Traffic Trends
    const traffic = await prisma.trafficLog.findMany({
      where: {
        tenant_id: tenantId,
        created_at: { gte: startDate },
      },
      orderBy: { created_at: "asc" },
    });

    // Aggregate by day
    const trafficByDay = traffic.reduce(
      (acc: Record<string, number>, log: any) => {
        const date = format(log.created_at, "MMM dd");
        acc[date] = (acc[date] || 0) + 1;
        return acc;
      },
      {},
    );

    // 2. Behavioral Heatmap (Interaction distribution)
    const interactions = await prisma.interactionLog.groupBy({
      by: ["event_type"],
      where: {
        tenant_id: tenantId,
        created_at: { gte: startDate },
      },
      _count: {
        id: true,
      },
      orderBy: {
        _count: {
          id: "desc",
        },
      },
      take: 10,
    });

    // 3. Geo Distribution (Top Regions/Cities)
    const geoDistribution = await prisma.trafficLog.groupBy({
      by: ["region", "city"],
      where: {
        tenant_id: tenantId,
        created_at: { gte: startDate },
      },
      _count: {
        id: true,
      },
      orderBy: {
        _count: {
          id: "desc",
        },
      },
      take: 20,
    });

    // 4. User Interaction Density (Top Users)
    const activeUsers = await prisma.interactionLog.groupBy({
      by: ["user_id"],
      where: {
        tenant_id: tenantId,
        user_id: { not: null },
        created_at: { gte: startDate },
      },
      _count: {
        id: true,
      },
      orderBy: {
        _count: {
          id: "desc",
        },
      },
      take: 5,
    });

    return {
      trafficTrends: Object.entries(trafficByDay).map(([date, count]) => ({
        date,
        count: count as number,
      })),
      interactionHeatmap: interactions.map((i: any) => ({
        type: i.event_type as string,
        count: i._count.id as number,
      })),
      geoData: geoDistribution.map((g: any) => ({
        region: (g.region as string) || "Unknown",
        city: (g.city as string) || "Unknown",
        count: g._count.id as number,
      })),
      activeUserDensity: activeUsers.map((u: any) => ({
        userId: u.user_id as number,
        count: u._count.id as number,
      })),
    };
  } catch (error) {
    console.error("[ANALYTICS] Failed to fetch metrics:", error);
    return null;
  }
}
