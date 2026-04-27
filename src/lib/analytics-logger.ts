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
  const source = req
    ? req
    : {
        headers: {
          get: (n: string) => {
            // This is a bit of a hack to safely use headers() in a non-async context if needed,
            // but it's better to just pass the headers in if available.
            return null;
          },
        },
      };

  // Vercel specific headers
  const ip =
    req?.ip ||
    req?.headers?.get("x-vercel-proxied-for") ||
    req?.headers?.get("x-forwarded-for")?.split(",")[0] ||
    null;
  const city = req?.headers?.get("x-vercel-ip-city");
  const region = req?.headers?.get("x-vercel-ip-country-region");
  const userAgent = req?.headers?.get("user-agent");

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
    const head = await headers();
    const meta = getRequestMetadata({ headers: head });

    await prisma.trafficLog.create({
      data: {
        tenant_id: tenantId,
        path,
        ip_address: meta.ip,
        city: meta.city,
        region: meta.region,
        user_agent: meta.userAgent,
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
  metadata?: any;
}) {
  try {
    const head = await headers();
    const meta = getRequestMetadata({ headers: head });

    await prisma.interactionLog.create({
      data: {
        event_type: params.eventType,
        tenant_id: params.tenantId,
        user_id: params.userId,
        metadata: params.metadata,
        ip_address: meta.ip,
        city: meta.city,
        region: meta.region,
      },
    });
  } catch (error) {
    console.error("[ANALYTICS] Failed to log interaction:", error);
  }
}
