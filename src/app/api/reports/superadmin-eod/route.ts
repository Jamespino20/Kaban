import { NextRequest, NextResponse } from "next/server";
import { generatePDF } from "@/lib/reporting/engine";
import { getAppBaseUrl } from "@/lib/db-url";
import { requireSuperadminSession } from "@/lib/authorization";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const date = searchParams.get("date");
  const reportSecret = process.env.REPORT_SECRET || "agapay-internal-secret";
  const isInternalRequest =
    req.headers.get("x-agapay-report-secret") === reportSecret;

  if (!isInternalRequest) {
    // Only superadmins can trigger this PDF generation
    await requireSuperadminSession();
  }

  const baseUrl = getAppBaseUrl();
  const reportUrl = `${baseUrl}/reports/superadmin-eod${
    date ? `?date=${encodeURIComponent(date)}` : ""
  }`;

  try {
    const pdfBuffer = await generatePDF(reportUrl, {
      format: "A4",
      margin: { top: "10mm", bottom: "10mm", left: "10mm", right: "10mm" },
    });

    return new NextResponse(pdfBuffer as any, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="Agapay-Superadmin-EOD-${date ?? new Date().toISOString().split("T")[0]}.pdf"`,
      },
    });
  } catch (error) {
    const errorMsg =
      error instanceof Error ? error.message : "Internal PDF Error";
    console.error("❌ Superadmin EOD PDF Generation Error:", error);
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}
