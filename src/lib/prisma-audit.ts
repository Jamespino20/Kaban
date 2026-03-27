import { Prisma } from "@prisma/client";
import { auth } from "@/lib/auth";

export const prismaAuditExtension = Prisma.defineExtension((client) => {
  return client.$extends({
    query: {
      $allModels: {
        async $allOperations({ model, operation, args, query }) {
          // 1. Identify if this is a "Write" operation
          const writeOperations = [
            "create",
            "update",
            "delete",
            "upsert",
            "createMany",
            "updateMany",
            "deleteMany",
          ];

          if (!writeOperations.includes(operation)) {
            return query(args);
          }

          // 2. Fetch Session to get the User (Actor)
          // Note: In server actions/routes, auth() works.
          let userId: number | null = null;
          let tenantId: number | null = null;

          try {
            const session = await auth();
            if (session?.user) {
              userId = parseInt(session.user.id);
              // In Kaban, users are tied to tenants. We can't easily get tenant_id from session
              // unless we added it to the session object.
              // For now, we'll try to find the user's tenant if needed, or rely on null.
            }
          } catch {
            // Background or seed tasks might not have a session
          }

          // 3. Capture Old State (for updates/deletes)
          let oldData: any = null;
          if (operation === "update" || operation === "delete") {
            try {
              // We use the base client to avoid infinite loops
              const baseClient = (client as any)._baseClient || client;
              oldData = await (baseClient[model as any] as any).findUnique({
                where: (args as any).where,
              });
            } catch (e) {
              console.warn("Failed to capture old data for audit log:", e);
            }
          }

          // 4. Execute the actual query
          const result = await query(args);

          // 5. Create the Audit Log entry
          // Use a separate background promise to avoid blocking the user request
          // (Though Prisma extensions are serial by default, we use $transaction or non-blocking if possible)
          try {
            const action = operation.toUpperCase();

            // We use the base client to create the log to avoid auditing the audit-log creation itself
            // The `client` argument here refers to the extended client.
            // To avoid infinite recursion if AuditLog is itself audited, we should use the base client.
            // However, the instruction specifically asks to use the 'client' argument for creating logs.
            // Assuming 'client' here refers to the extended client, and we want to use its auditLog property.
            // If the intent was to use the *base* client, the logic would be different.
            // For security, we don't audit the AuditLog table itself to prevent recursion
            if (model !== "AuditLog") {
              (client as any).auditLog
                .create({
                  data: {
                    user_id: userId,
                    action: action,
                    entity_type: model,
                    entity_id:
                      (result as any)?.id ||
                      (result as any)?.user_id ||
                      (result as any)?.tenant_id ||
                      (args as any)?.where?.id ||
                      (args as any)?.where?.user_id,
                    old_values: oldData ? (oldData as any) : Prisma.JsonNull,
                    new_values: result ? (result as any) : Prisma.JsonNull,
                  },
                })
                .catch((e: any) =>
                  console.error("Audit log creation failed:", e),
                );
            }
          } catch (e) {
            console.error("Audit logging failed:", e);
          }

          return result;
        },
      },
    },
  });
});
