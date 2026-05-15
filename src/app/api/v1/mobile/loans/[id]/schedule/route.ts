import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAuthUser } from "@/app/api/v1/mobile/_helpers";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const loanId = parseInt(id, 10);
    if (isNaN(loanId)) {
      return NextResponse.json({ status: "error", message: "Invalid loan ID." }, { status: 400 });
    }

    const auth = await getAuthUser(_req);

    const loan = await prisma.loan.findUnique({
      where: { loan_id: loanId },
      select: { loan_id: true, user_id: true },
    });

    if (!loan || loan.user_id !== auth.user_id) {
      return NextResponse.json({ status: "error", message: "Loan not found." }, { status: 404 });
    }

    const schedules = await prisma.loanSchedule.findMany({
      where: { loan_id: loanId },
      orderBy: { installment_number: "asc" },
      select: {
        schedule_id: true,
        installment_number: true,
        due_date: true,
        principal_amount: true,
        interest_amount: true,
        total_due: true,
        status: true,
        paid_at: true,
        days_late: true,
        penalty_applied: true,
      },
    });

    return NextResponse.json({ status: "success", data: schedules });
  } catch (error: any) {
    return NextResponse.json({ status: "error", message: error.message }, { status: 500 });
  }
}
