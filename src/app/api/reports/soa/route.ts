import { NextRequest, NextResponse } from "next/server";
import { generatePDF } from "@/lib/reporting/engine";
import { getAppBaseUrl } from "@/lib/db-url";

/**
 * API Route to trigger PDF generation for a Statement of Account.
 * Role: Borrower / Admin
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId");
  const tenantId = searchParams.get("tenantId");

  if (!userId || !tenantId) {
    return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
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
