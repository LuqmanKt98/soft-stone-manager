import { CloudOff } from "lucide-react";

export const metadata = { title: "Offline" };

export default function OfflinePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-6 text-center">
      <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted">
        <CloudOff className="h-8 w-8 text-muted-foreground" />
      </span>
      <div>
        <h1 className="text-xl font-semibold">You&apos;re offline</h1>
        <p className="mt-1 max-w-sm text-sm text-muted-foreground">
          This page hasn&apos;t been loaded yet. Reconnect to the internet to view
          the latest data. Previously opened pages remain available.
        </p>
      </div>
    </div>
  );
}
