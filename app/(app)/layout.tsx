import { AppShell } from "@/components/layout/app-shell";
import { getSettings } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const settings = await getSettings();
  return <AppShell businessName={settings.businessName}>{children}</AppShell>;
}
