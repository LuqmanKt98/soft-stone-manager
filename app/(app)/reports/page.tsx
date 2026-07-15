import { PageHeader } from "@/components/dashboard/page-header";
import { ReportsClient } from "@/components/reports/reports-client";
import { getTrucks, getPayments, getSettings } from "@/lib/data";

export const dynamic = "force-dynamic";
export const metadata = { title: "Reports" };

export default async function ReportsPage() {
  const [trucks, payments, settings] = await Promise.all([
    getTrucks(),
    getPayments(),
    getSettings(),
  ]);
  return (
    <div>
      <PageHeader
        eyebrow="Insights"
        title="Reports"
        description="Generate and export professional reports for any period."
      />
      <ReportsClient trucks={trucks} payments={payments} settings={settings} />
    </div>
  );
}
