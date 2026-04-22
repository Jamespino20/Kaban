import { NextRequest, NextResponse } from "next/server";
import { generatePDF } from "@/lib/reporting/engine";
import { getAppBaseUrl } from "@/lib/db-url";
import { auth } from "@/lib/auth";

/**
 * API Route to trigger PDF generation for a Statement of Account.
 * Role: Borrower / Admin
 */
export async function GET(req: NextRequest) {
  const session = await auth();
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId");
  const tenantId = searchParams.get("tenantId");

  if (!userId || !tenantId) {
    return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
  }

  if (!session?.user?.id || !session.user.tenantId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const requestedUserId = Number.parseInt(userId, 10);
  const requestedTenantId = Number.parseInt(tenantId, 10);
  const isAdmin =
    session.user.role === "admin" || session.user.role === "superadmin";
  const sameMember =
    session.user.role === "member" &&
    session.user.user_id === requestedUserId &&
    session.user.tenantId === requestedTenantId;
  const sameTenantAdmin = isAdmin && session.user.tenantId === requestedTenantId;

  if (!sameMember && !sameTenantAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    // Construct the internal URL that Puppeteer will visit
    // We use the absolute URL to ensure navigation works in both Dev and Prod
    const baseUrl = getAppBaseUrl();
    const reportUrl = `${baseUrl}/reports/soa?userId=${userId}&tenantId=${tenantId}`;

    console.log(`🖨️ Generating SOA PDF for ${reportUrl}`);

    const pdfBuffer = await generatePDF(reportUrl, {
      format: "A4",
      margin: { top: "10mm", bottom: "10mm", left: "10mm", right: "10mm" },
    });

    return new NextResponse(pdfBuffer as any, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="Agapay-SOA-${userId}.pdf"`,
      },
    });
  } catch (error: any) {
    console.error("❌ PDF Generation Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
