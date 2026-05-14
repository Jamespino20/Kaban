import { Prisma } from "@prisma/client";
import prisma from "@/lib/prisma";

import { headers } from "next/headers";

/**
 * Anonymizes an IP address by masking the last octet (IPv4) or the last 64 bits (IPv6).
 */
export function anonymizeIP(ip: string | null): string | null {
  if (!ip) return null;
  if (ip.includes(".")) {
    const parts = ip.split(".");
    if (parts.length === 4) {
      return `${parts[0]}.${parts[1]}.${parts[2]}.0`;
    }
  } else if (ip.includes(":")) {
    const parts = ip.split(":");
    if (parts.length >= 4) {
      return `${parts.slice(0, 4).join(":")}:0:0:0:0`;
    }
  }
  return ip;
}

/**
 * Common metadata extractor for both Middleware (NextRequest) and Server Components (headers()).
 */
export function getRequestMetadata(req?: {
  headers: { get: (name: string) => string | null };
  ip?: string;
}) {
  // If req is provided, use it (Middleware), otherwise use next/headers (Server Actions/RSC)
  // If req is provided, use it (Middleware), otherwise use next/headers (Server Actions/RSC)
  const headersObj = req
    ? req.headers
    : {
        get: (_n: string) => null,
      };

  // Vercel specific headers
  const ip =
    req?.ip ||
    headersObj.get("x-vercel-proxied-for") ||
    headersObj.get("x-forwarded-for")?.split(",")[0] ||
    null;
  const city = headersObj.get("x-vercel-ip-city");
  const region = headersObj.get("x-vercel-ip-country-region");
  const userAgent = headersObj.get("user-agent");

  return {
    ip: anonymizeIP(ip),
    city: city ? decodeURIComponent(city) : null,
    region: region || null,
    userAgent,
  };
}

/**
 * Captures a traffic log entry.
 */
export async function logTraffic(path: string, tenantId?: number | null) {
  try {
    const head = await headers().catch(() => null);
    if (!head) return; // Skip logging during static generation

    const meta = getRequestMetadata({ headers: head });

    await prisma.auditLog.create({
      data: {
        log_type: "TRAFFIC",
        tenant_id: tenantId,
        route: path,
        ip_address: meta.ip,
        city: meta.city,
        region: meta.region,
        user_agent: meta.userAgent,
        action: "page_view",
        module: "system",
        entity_type: "page",
      },
    });
  } catch (error) {
    console.error("[ANALYTICS] Failed to log traffic:", error);
  }
}

/**
 * Captures a behavioral interaction event.
 */
export async function logInteraction(params: {
  eventType: string;
  tenantId?: number | null;
  userId?: number | null;
  metadata?: Record<string, unknown>;
}) {
  try {
    const head = await headers().catch(() => null);
    if (!head) return; // Skip logging during static generation

    const meta = getRequestMetadata({ headers: head });

    await prisma.auditLog.create({
      data: {
        log_type: "INTERACTION",
        event_type: params.eventType,
        tenant_id: params.tenantId,
        user_id: params.userId,
        metadata: params.metadata as Prisma.InputJsonValue | undefined,
        ip_address: meta.ip,
        city: meta.city,
        region: meta.region,
        action: "user_interaction",
        module: "system",
        entity_type: "interaction",
      },
    });
  } catch (error) {
    console.error("[ANALYTICS] Failed to log interaction:", error);
  }
}
