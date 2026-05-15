import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { sql } from "@/lib/db";
import * as z from "zod";
import { createAuthToken } from "../../_helpers";

const LoginSchema = z.object({
  username: z.string(),
  password: z.string(),
  tenantId: z.number().int().positive(),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const validatedFields = LoginSchema.safeParse(body);

    if (!validatedFields.success) {
      return NextResponse.json(
        { status: "error", message: "Invalid credentials format." },
        { status: 400 }
      );
    }

    const { username, password, tenantId } = validatedFields.data;

    // Use sql() for performance parity with existing local auth logic
    const users: any[] = await sql(
      `SELECT u.user_id, u.tenant_id, u.username, u.email, u.password_hash, u.role, u.status, u.member_code, t.slug as tenant_slug 
       FROM users u 
       LEFT JOIN tenants t ON u.tenant_id = t.tenant_id 
       WHERE u.tenant_id = ? AND (u.email = ? OR u.username = ?) 
       LIMIT 1`,
      [tenantId, username, username]
    );

    const user = users[0];

    if (!user) {
      return NextResponse.json(
        { status: "error", message: "User not found or does not belong to this tenant." },
        { status: 401 }
      );
    }

    if (user.status === "suspended") {
      return NextResponse.json(
        { status: "error", message: "Account is suspended." },
        { status: 403 }
      );
    }

    const passwordsMatch = await bcrypt.compare(password, user.password_hash);

    if (!passwordsMatch) {
      return NextResponse.json(
        { status: "error", message: "Invalid password." },
        { status: 401 }
      );
    }

    // Check for 2FA requirement (Member dashboard often needs 2FA in Agapay)
    const twoFaRows = await sql(
      "SELECT is_enabled FROM two_factor_auth WHERE user_id = ?",
      [user.user_id]
    );
    const twoFa = twoFaRows[0] as any;

    if (twoFa?.is_enabled) {
      return NextResponse.json({
        status: "success",
        requires_2fa: true,
        user: {
          user_id: user.user_id,
          username: user.username,
          email: user.email,
          role: user.role,
          tenant_id: user.tenant_id,
        }
      });
    }

    // Generate auth token for subsequent API calls
    const token = await createAuthToken(user.user_id, user.tenant_id);

    return NextResponse.json({
      status: "success",
      token,
      user: {
        user_id: user.user_id,
        username: user.username,
        email: user.email,
        role: user.role,
        tenant_id: user.tenant_id,
        tenant_slug: user.tenant_slug,
        member_code: user.member_code,
      }
    });
  } catch (error) {
    console.error("Mobile login error:", error);
    return NextResponse.json(
      { status: "error", message: "Internal server error." },
      { status: 500 }
    );
  }
}
