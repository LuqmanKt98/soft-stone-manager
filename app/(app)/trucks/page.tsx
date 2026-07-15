import { PageHeader } from "@/components/dashboard/page-header";
import { TrucksClient } from "@/components/trucks/trucks-client";
import { getTrucks, getSettings } from "@/lib/data";

export const dynamic = "force-dynamic";
export const metadata = { title: "Trucks" };

export default async function TrucksPage() {
  const [trucks, settings] = await Promise.all([getTrucks(), getSettings()]);
  return (
    <div>
      <PageHeader
        title="Truck Management"
        description="Record every truck trip. Profit and transport savings are calculated automatically."
      />
      <TrucksClient trucks={trucks} settings={settings} />
    </div>
  );
}
