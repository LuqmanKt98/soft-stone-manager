import { PageHeader } from "@/components/dashboard/page-header";
import { PaymentsClient } from "@/components/payments/payments-client";
import { getTrucks, getPayments } from "@/lib/data";
import { computeTotals, sumPayments } from "@/lib/calculations";

export const dynamic = "force-dynamic";
export const metadata = { title: "Payments" };

export default async function PaymentsPage() {
  const [trucks, payments] = await Promise.all([getTrucks(), getPayments()]);
  const billed = computeTotals(trucks).salesRevenue;
  const received = sumPayments(payments);
  return (
    <div>
      <PageHeader
        eyebrow="Operations"
        title="Payment Management"
        description="Track invoices, partial payments and outstanding receivables from the company."
      />
      <PaymentsClient payments={payments} billed={billed} received={received} />
    </div>
  );
}
