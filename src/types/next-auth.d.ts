import { DefaultSession, DefaultUser } from "next-auth";
import { JWT } from "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      user_id: number;
      role: string;
      tenantId: number | null;
      username: string;
      accessibleTenantIds: number[];
    } & DefaultSession["user"];
  }

  interface User extends DefaultUser {
    user_id: number;
    role: string;
    tenantId: number | null;
    username: string;
    accessibleTenantIds?: number[];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    user_id: number;
    role: string;
    tenantId: number | null;
    username: string;
    accessibleTenantIds?: number[];
  }
}
