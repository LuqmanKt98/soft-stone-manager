import { PageHeader } from "@/components/dashboard/page-header";
import { SettingsClient } from "@/components/settings/settings-client";
import { getSettings } from "@/lib/data";

export const dynamic = "force-dynamic";
export const metadata = { title: "Settings" };

export default async function SettingsPage() {
  const settings = await getSettings();
  return (
    <div>
      <PageHeader
        eyebrow="System"
        title="Settings"
        description="Configure default rates and manage your data."
      />
      <SettingsClient settings={settings} />
    </div>
  );
}
