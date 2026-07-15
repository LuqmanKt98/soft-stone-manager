"use client";

import * as React from "react";
import { Download } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function InstallButton() {
  const [deferred, setDeferred] = React.useState<BeforeInstallPromptEvent | null>(null);

  React.useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BeforeInstallPromptEvent);
    };
    window.addEventListener("beforeinstallprompt", handler);
    const installed = () => setDeferred(null);
    window.addEventListener("appinstalled", installed);
    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
      window.removeEventListener("appinstalled", installed);
    };
  }, []);

  if (!deferred) return null;

  return (
    <button
      onClick={async () => {
        await deferred.prompt();
        await deferred.userChoice;
        setDeferred(null);
      }}
      className="inline-flex h-9 items-center gap-1.5 rounded-md bg-primary px-3 text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
    >
      <Download className="h-4 w-4" />
      <span className="hidden sm:inline">Install</span>
    </button>
  );
}
