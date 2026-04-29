import { NextResponse } from "next/server";
import { LoanService } from "@/services/loan-service";
import * as z from "zod";
import { RepaymentFrequency } from "@prisma/client";
import { MICROFINANCE_POLICY } from "@/lib/microfinance-policy";

const LoanApplicationSchema = z.object({
  product_id: z.coerce.number().min(1, "Product is required"),
  amount: z.coerce
    .number()
    .min(
      MICROFINANCE_POLICY.minAmount,
      `Minimum PHP ${MICROFINANCE_POLICY.minAmount.toLocaleString()} is required`,
    ),
  term_months: z.coerce
    .number()
    .min(
      MICROFINANCE_POLICY.minTermMonths,
      `Minimum ${MICROFINANCE_POLICY.minTermMonths} months is required`,
    )
    .max(
      MICROFINANCE_POLICY.maxTermMonths,
      `Maximum ${MICROFINANCE_POLICY.maxTermMonths} months is allowed`,
    ),
  guarantor_ids: z
    .array(z.coerce.number())
    .min(
      MICROFINANCE_POLICY.minGuarantors,
      `At least ${MICROFINANCE_POLICY.minGuarantors} guarantor is required`,
    )
    .max(
      MICROFINANCE_POLICY.maxGuarantors,
      `At most ${MICROFINANCE_POLICY.maxGuarantors} guarantors are allowed`,
    ),
  repayment_frequency: z
    .nativeEnum(RepaymentFrequency)
    .default(RepaymentFrequency.monthly),
});

/**
 * REST API Endpoint for Mobile Loan Applications.
 * This endpoint allows external mobile applications (React Native/Java)
 * to submit loan applications using the shared Agapay business logic.
 */
export async function POST(req: Request) {
  try {
    // -------------------------------------------------------------------------
    // SECURITY NOTE for Mobile Team:
    // -------------------------------------------------------------------------
    // In this "Mobile Readiness" phase, we've enabled the logic layer.
    // THE NEXT STEP would be implementing a Bearer Token (JWT) extractor here.
    // For this Proof-of-Concept, identity must be provided in the body or header.
    // -------------------------------------------------------------------------

    const body = await req.json();

    // For PoC purposes, we expect a 'context' object.
    // In production, this would be derived from the auth token.
    const { context, params } = body;

    if (!context || !context.user_id || !context.tenant_id) {
      return NextResponse.json(
        { error: "Unauthorized: Context required for mobile PoC." },
        { status: 401 },
      );
    }

    const validatedFields = LoanApplicationSchema.safeParse(params);
    if (!validatedFields.success) {
      return NextResponse.json(
        { error: "Invalid fields!", details: validatedFields.error.format() },
        { status: 400 },
      );
    }

    const result = await LoanService.applyForLoan(
      {
        user_id: context.user_id,
        tenant_id: context.tenant_id,
        role: context.role || "member",
        email: context.email || "",
      },
      validatedFields.data,
    );

    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("LOAN_API_ERROR:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
