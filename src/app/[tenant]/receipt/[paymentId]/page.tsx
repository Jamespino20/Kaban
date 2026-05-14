import { getPaymentReceiptData } from "@/actions/receipt-actions";
import { ReceiptView } from "@/components/receipt/receipt-view";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function ReceiptPage({
  params,
}: {
  params: Promise<{ tenant: string; paymentId: string }>;
}) {
  const { paymentId } = await params;

  try {
    const payment = await getPaymentReceiptData(parseInt(paymentId));
    
    if (!payment) {
      return notFound();
    }

    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 sm:p-8">
        <ReceiptView payment={payment} />
      </div>
    );
  } catch (error) {
    console.error("Receipt Error:", error);
    return notFound();
  }
}
