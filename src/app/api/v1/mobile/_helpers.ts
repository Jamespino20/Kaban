import prisma from "@/lib/prisma";
import { v4 as uuidv4 } from "uuid";

export interface AuthUser {
  user_id: number;
  tenant_id: number;
  role: string;
}

export async function getAuthUser(req: Request): Promise<AuthUser> {
  const auth = req.headers.get("authorization") || "";
  if (!auth.startsWith("Bearer ")) throw new Error("Unauthorized");

  const token = auth.slice(7);
  const tokenRecord = await prisma.authToken.findUnique({ where: { token } });
  if (!tokenRecord || tokenRecord.expires < new Date()) throw new Error("Token expired");

  if (!tokenRecord.user_id) throw new Error("Invalid token: no user associated");

  const user = await prisma.user.findUnique({
    where: { user_id: tokenRecord.user_id },
    select: { user_id: true, tenant_id: true, role: true },
  });
  if (!user) throw new Error("User not found");
  return user as AuthUser;
}

export async function createAuthToken(userId: number, tenantId: number): Promise<string> {
  const token = uuidv4();
  await prisma.authToken.create({
    data: {
      email: "",
      token,
      type: "VERIFICATION",
      expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      user_id: userId,
      tenant_id: tenantId,
    },
  });
  return token;
}
