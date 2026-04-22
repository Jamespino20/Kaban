import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaNeon, PrismaNeonHttp } from "@prisma/adapter-neon";
import { neonConfig } from "@neondatabase/serverless";
import ws from "ws";
import { auth } from "@/lib/auth"; // For tenant context
import { getDbUrl } from "@/lib/db-url";

/**
 * AGAPAY APEX PRISMA SINGLETON (v12 - HYBRID ADAPTER EDITION)
 */

declare global {
  var agapay_apex_prisma: any | undefined;
}

const getAdapterMode = () => {
  const explicitMode = process.env.AGAPAY_PRISMA_ADAPTER?.toLowerCase();
  if (explicitMode === "http" || explicitMode === "ws") {
    return explicitMode;
  }

  // This app relies on transactions for its Prisma extension and tests,
  // so the websocket adapter is the safe default in local Node runtimes.
  return "ws";
};

const getPrisma = (): any => {
  if (globalThis.agapay_apex_prisma) return globalThis.agapay_apex_prisma;

  const rawUrl = getDbUrl();
  // Aggressive sanitization to eliminate hidden character corruption
  const connectionString = rawUrl
    ? rawUrl.replace(/["'\r\n\s]/g, "").trim()
    : "";

  try {
    neonConfig.webSocketConstructor = ws;

    console.log("📡 AGAPAY_PRISMA: Initializing Hybrid Adapter...");
    console.log(
      "📡 AGAPAY_PRISMA: Connection String Status =",
      connectionString ? "PRESENT" : "MISSING",
    );

    const adapterMode = getAdapterMode();
    let adapter;
    if (adapterMode === "ws") {
      console.log(
        "📡 AGAPAY_PRISMA: Using PrismaNeon (WebSocket) adapter.",
      );
      adapter = new PrismaNeon({ connectionString } as any);
    } else {
      console.log(
        "📡 AGAPAY_PRISMA: Using PrismaNeonHttp adapter (transactions disabled).",
      );
      adapter = new PrismaNeonHttp(connectionString, {
        // Default options for HTTP connection
      } as any);
    }

    const baseClient = new PrismaClient({
      adapter,
      log: ["query", "error", "warn"],
    } as any);

    // Extension Layer (RLS & Audit)
    const extendedClient = baseClient.$extends({
      query: {
        $allModels: {
          async $allOperations({ model, operation, args, query }) {
            let tenantId: number | null = null;
            let userId: number | null = null;

            try {
              const session = await auth();
              if (session?.user) {
                tenantId = session.user.tenantId
                  ? parseInt(session.user.tenantId.toString())
                  : null;
                userId = session.user.user_id
                  ? parseInt(session.user.user_id.toString())
                  : null;
              }
            } catch (e) {}

            const isRead =
              operation.startsWith("find") || operation.startsWith("count");

            if (isRead && model !== "AuditLog" && (tenantId || userId)) {
              baseClient.auditLog
                .create({
                  data: {
                    tenant_id: tenantId,
                    user_id: userId,
                    action: `READ_${operation.toUpperCase()}`,
                    entity_type: model,
                    ip_address: "internal",
                    new_values: { args } as any,
                  },
                })
                .catch(() => {});
            }

            return baseClient.$transaction(async (tx) => {
              if (tenantId)
                await tx.$executeRawUnsafe(
                  `SET LOCAL app.tenant_id = ${tenantId}`,
                );
              if (userId)
                await tx.$executeRawUnsafe(`SET LOCAL app.user_id = ${userId}`);
              return query(args);
            });
          },
        },
      },
    });

    globalThis.agapay_apex_prisma = extendedClient;
    return extendedClient;
  } catch (error) {
    console.error("❌ AGAPAY: Prisma Singleton Critical Failure:", error);
    throw error;
  }
};

const prisma = getPrisma();
export default prisma;
