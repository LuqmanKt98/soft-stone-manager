"use client";

import * as React from "react";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";
import { cn } from "@/lib/utils";

type ToastType = "success" | "error" | "info";
interface Toast {
  id: number;
  message: string;
  type: ToastType;
}

interface ToastContextValue {
  toast: (message: string, type?: ToastType) => void;
}
const ToastContext = React.createContext<ToastContextValue | null>(null);

export function useToast() {
  const ctx = React.useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<Toast[]>([]);

  const toast = React.useCallback((message: string, type: ToastType = "success") => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t, { id, message, type }]);
    setTimeout(() => {
      setToasts((t) => t.filter((x) => x.id !== id));
    }, 3800);
  }, []);

  const remove = (id: number) => setToasts((t) => t.filter((x) => x.id !== id));

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="pointer-events-none fixed bottom-4 right-4 z-[100] flex w-full max-w-sm flex-col gap-2">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={cn(
              "pointer-events-auto flex items-start gap-3 rounded-lg border bg-card p-4 shadow-lg animate-in",
              t.type === "success" && "border-success/30",
              t.type === "error" && "border-destructive/30",
              t.type === "info" && "border-border",
            )}
          >
            {t.type === "success" && (
              <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-success" />
            )}
            {t.type === "error" && (
              <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-destructive" />
            )}
            {t.type === "info" && (
              <Info className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
            )}
            <p className="flex-1 text-sm leading-snug">{t.message}</p>
            <button
              onClick={() => remove(t.id)}
              className="text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
