"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/toast";
import { createPayment, type PaymentInputDTO } from "@/lib/actions";
import { formatPKR } from "@/lib/format";

const METHODS = ["Bank Transfer", "Cash", "Cheque", "Online", "Other"] as const;

export function PaymentForm({
  open,
  onOpenChange,
  outstanding,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  outstanding: number;
}) {
  const router = useRouter();
  const { toast } = useToast();
  const [saving, setSaving] = React.useState(false);
  const [form, setForm] = React.useState({
    date: new Date().toISOString().slice(0, 10),
    amount: "",
    method: "Bank Transfer" as (typeof METHODS)[number],
    reference: "",
    notes: "",
  });

  React.useEffect(() => {
    if (open) {
      setForm({
        date: new Date().toISOString().slice(0, 10),
        amount: "",
        method: "Bank Transfer",
        reference: "",
        notes: "",
      });
    }
  }, [open]);

  const set = (k: keyof typeof form, v: string) =>
    setForm((f) => ({ ...f, [k]: v }));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const res = await createPayment(form as PaymentInputDTO);
    setSaving(false);
    if (res.ok) {
      toast("Payment recorded.", "success");
      onOpenChange(false);
      router.refresh();
    } else {
      toast(res.error, "error");
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md" onClose={() => onOpenChange(false)}>
        <DialogHeader>
          <DialogTitle>Record Payment</DialogTitle>
          <DialogDescription>
            Outstanding balance: {formatPKR(outstanding)}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Date</Label>
              <Input
                type="date"
                value={form.date}
                onChange={(e) => set("date", e.target.value)}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label>Amount (PKR)</Label>
              <Input
                type="number"
                value={form.amount}
                onChange={(e) => set("amount", e.target.value)}
                placeholder="0"
                required
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Method</Label>
            <Select value={form.method} onChange={(e) => set("method", e.target.value)}>
              {METHODS.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Reference (optional)</Label>
            <Input
              value={form.reference}
              onChange={(e) => set("reference", e.target.value)}
              placeholder="Cheque no. / transaction id"
            />
          </div>
          <div className="space-y-1.5">
            <Label>Notes (optional)</Label>
            <Textarea
              value={form.notes}
              onChange={(e) => set("notes", e.target.value)}
              rows={2}
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving && <Loader2 className="h-4 w-4 animate-spin" />}
              Record Payment
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
