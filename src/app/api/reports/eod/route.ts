import { NextRequest, NextResponse } from "next/server";
import { generatePDF } from "@/lib/reporting/engine";
import { getAppBaseUrl } from "@/lib/db-url";
import { requireTanawSession } from "@/lib/authorization";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const tenantIdParam = searchParams.get("tenantId");
  const date = searchParams.get("date");
  const reportSecret = process.env.REPORT_SECRET || "agapay-internal-secret";
  const isInternalRequest =
    req.headers.get("x-agapay-report-secret") === reportSecret;

  let tenantId: number | undefined;
  if (tenantIdParam) {
    tenantId = Number(tenantIdParam);
    if (Number.isNaN(tenantId)) {
      return NextResponse.json(
        { error: "Invalid tenantId" },
        { status: 400 },
      );
    }
  }

  if (!isInternalRequest) {
    const session = await requireTanawSession();

    if (session.user.role === "operator") {
      tenantId = tenantId ?? session.user.tenantId ?? undefined;
      if (tenantIdParam && tenantId !== Number(tenantIdParam)) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
    }

    if (session.user.role === "superadmin" && !tenantId) {
      return NextResponse.json(
        { error: "Missing tenantId" },
        { status: 400 },
      );
    }
  }

  if (!tenantId) {
    return NextResponse.json({ error: "Missing tenantId" }, { status: 400 });
  }

  const baseUrl = getAppBaseUrl();
  const reportUrl = `${baseUrl}/reports/eod?tenantId=${tenantId}${
    date ? `&date=${encodeURIComponent(date)}` : ""
  }`;

  try {
    const pdfBuffer = await generatePDF(reportUrl, {
      format: "A4",
      margin: { top: "10mm", bottom: "10mm", left: "10mm", right: "10mm" },
    });

    return new NextResponse(pdfBuffer as any, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="Agapay-EOD-${tenantId}-${date ?? new Date().toISOString().split("T")[0]}.pdf"`,
      },
    });
  } catch (error) {
    const errorMsg =
      error instanceof Error ? error.message : "Internal PDF Error";
    console.error("❌ EOD PDF Generation Error:", error);
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}
