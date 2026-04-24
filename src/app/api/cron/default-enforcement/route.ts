import { NextRequest, NextResponse } from "next/server";
import { runAutomatedDefaultEnforcement } from "@/lib/default-enforcement";
import { requireAdminSession } from "@/lib/authorization";

function isAuthorizedCronRequest(req: NextRequest) {
  const secret = process.env.AGAPAY_CRON_SECRET;
  if (!secret) {
    return false;
  }

  const bearer = req.headers.get("authorization");
  const headerSecret = req.headers.get("x-agapay-cron-secret");

  return (
    bearer === `Bearer ${secret}` ||
    headerSecret === secret ||
    req.nextUrl.searchParams.get("key") === secret
  );
}

export async function POST(req: NextRequest) {
  let actorUserId: number | undefined;
  let tenantId: number | undefined;

  if (isAuthorizedCronRequest(req)) {
    actorUserId = undefined;
  } else {
    try {
      const session = await requireAdminSession();
      actorUserId = session.user.user_id;
      tenantId = session.user.tenantId ?? undefined;
    } catch {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  try {
    const result = await runAutomatedDefaultEnforcement({
      tenantId,
      actorUserId,
    });

    return NextResponse.json({
      ok: true,
      ...result,
    });
  } catch (error) {
    console.error("default enforcement cron failed:", error);
    return NextResponse.json(
      { error: "Default enforcement failed." },
      { status: 500 },
    );
  }
}

export async function GET(req: NextRequest) {
  return POST(req);
}
