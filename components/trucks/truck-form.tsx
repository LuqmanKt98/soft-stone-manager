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
import { computeTruck } from "@/lib/calculations";
import { formatPKR } from "@/lib/format";
import { createTruck, updateTruck, type TruckInputDTO } from "@/lib/actions";
import type { Truck, Settings } from "@/db/schema";

function today() {
  return new Date().toISOString().slice(0, 10);
}

type FormState = {
  date: string;
  truckNumber: string;
  driverName: string;
  materialType: "100-I" | "100-W";
  tons: string;
  purchaseRate: string;
  sellingRate: string;
  companyRentalRate: string;
  actualRentalRate: string;
  loadingCost: string;
  boardingCost: string;
  otherExpenses: string;
  notes: string;
};

function initialState(settings: Settings, truck?: Truck): FormState {
  if (truck) {
    return {
      date: truck.date,
      truckNumber: truck.truckNumber,
      driverName: truck.driverName ?? "",
      materialType: truck.materialType,
      tons: truck.tons,
      purchaseRate: truck.purchaseRate,
      sellingRate: truck.sellingRate,
      companyRentalRate: truck.companyRentalRate,
      actualRentalRate: truck.actualRentalRate,
      loadingCost: truck.loadingCost,
      boardingCost: truck.boardingCost,
      otherExpenses: truck.otherExpenses,
      notes: truck.notes ?? "",
    };
  }
  return {
    date: today(),
    truckNumber: "",
    driverName: "",
    materialType: "100-I",
    tons: "40",
    purchaseRate: settings.purchaseRate,
    sellingRate: settings.sellingRate,
    companyRentalRate: settings.companyRentalRate,
    actualRentalRate: settings.actualRentalRate,
    loadingCost: "6000",
    boardingCost: "1000",
    otherExpenses: "0",
    notes: "",
  };
}

export function TruckForm({
  open,
  onOpenChange,
  settings,
  truck,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  settings: Settings;
  truck?: Truck;
}) {
  const router = useRouter();
  const { toast } = useToast();
  const [form, setForm] = React.useState<FormState>(() =>
    initialState(settings, truck),
  );
  const [saving, setSaving] = React.useState(false);

  React.useEffect(() => {
    if (open) setForm(initialState(settings, truck));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, truck]);

  const set = (key: keyof FormState, value: string) =>
    setForm((f) => ({ ...f, [key]: value }));

  const num = (v: string) => parseFloat(v) || 0;
  const preview = computeTruck({
    tons: num(form.tons),
    purchaseRate: num(form.purchaseRate),
    sellingRate: num(form.sellingRate),
    companyRentalRate: num(form.companyRentalRate),
    actualRentalRate: num(form.actualRentalRate),
    loadingCost: num(form.loadingCost),
    boardingCost: num(form.boardingCost),
    otherExpenses: num(form.otherExpenses),
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const payload: TruckInputDTO = { ...form };
    const res = truck
      ? await updateTruck(truck.id, payload)
      : await createTruck(payload);
    setSaving(false);
    if (res.ok) {
      toast(truck ? "Truck trip updated." : "Truck trip added.", "success");
      onOpenChange(false);
      router.refresh();
    } else {
      toast(res.error, "error");
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl" onClose={() => onOpenChange(false)}>
        <DialogHeader>
          <DialogTitle>{truck ? "Edit Truck Trip" : "Add Truck Trip"}</DialogTitle>
          <DialogDescription>
            Enter trip details — profit figures are calculated automatically.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="grid gap-5 lg:grid-cols-[1fr_260px]">
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <Field label="Date">
                <Input
                  type="date"
                  value={form.date}
                  onChange={(e) => set("date", e.target.value)}
                  required
                />
              </Field>
              <Field label="Truck Number">
                <Input
                  value={form.truckNumber}
                  onChange={(e) => set("truckNumber", e.target.value)}
                  placeholder="e.g. LES-4590"
                  required
                />
              </Field>
              <Field label="Driver Name (optional)">
                <Input
                  value={form.driverName}
                  onChange={(e) => set("driverName", e.target.value)}
                  placeholder="Driver"
                />
              </Field>
              <Field label="Material Type">
                <Select
                  value={form.materialType}
                  onChange={(e) => set("materialType", e.target.value)}
                >
                  <option value="100-I">100-I</option>
                  <option value="100-W">100-W</option>
                </Select>
              </Field>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              <Field label="Tons Loaded">
                <Input
                  type="number"
                  step="0.01"
                  value={form.tons}
                  onChange={(e) => set("tons", e.target.value)}
                  required
                />
              </Field>
              <Field label="Purchase Rate">
                <Input
                  type="number"
                  value={form.purchaseRate}
                  onChange={(e) => set("purchaseRate", e.target.value)}
                />
              </Field>
              <Field label="Selling Rate">
                <Input
                  type="number"
                  value={form.sellingRate}
                  onChange={(e) => set("sellingRate", e.target.value)}
                />
              </Field>
              <Field label="Company Rental Rate">
                <Input
                  type="number"
                  value={form.companyRentalRate}
                  onChange={(e) => set("companyRentalRate", e.target.value)}
                />
              </Field>
              <Field label="Actual Rental Rate">
                <Input
                  type="number"
                  value={form.actualRentalRate}
                  onChange={(e) => set("actualRentalRate", e.target.value)}
                />
              </Field>
              <div />
              <Field label="Loading Cost">
                <Input
                  type="number"
                  value={form.loadingCost}
                  onChange={(e) => set("loadingCost", e.target.value)}
                />
              </Field>
              <Field label="Boarding Cost">
                <Input
                  type="number"
                  value={form.boardingCost}
                  onChange={(e) => set("boardingCost", e.target.value)}
                />
              </Field>
              <Field label="Other Expenses">
                <Input
                  type="number"
                  value={form.otherExpenses}
                  onChange={(e) => set("otherExpenses", e.target.value)}
                />
              </Field>
            </div>

            <Field label="Notes (optional)">
              <Textarea
                value={form.notes}
                onChange={(e) => set("notes", e.target.value)}
                placeholder="Any remarks about this trip…"
                rows={2}
              />
            </Field>
          </div>

          {/* Live preview */}
          <div className="space-y-2 rounded-lg border border-border bg-muted/40 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Calculated
            </p>
            <PreviewRow label="Purchase Cost" value={preview.purchaseCost} />
            <PreviewRow label="Sales Revenue" value={preview.salesRevenue} />
            <PreviewRow label="Gross Profit" value={preview.grossProfit} />
            <div className="my-1 border-t border-border" />
            <PreviewRow label="Transport Cost" value={preview.transportCost} />
            <PreviewRow
              label="Transport Savings"
              value={preview.transportSavings}
              accent="success"
            />
            <PreviewRow label="Add. Expenses" value={preview.additionalExpenses} />
            <div className="my-1 border-t border-border" />
            <PreviewRow label="Net Profit" value={preview.netProfit} strong />
          </div>

          <div className="flex justify-end gap-2 lg:col-span-2">
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
              {truck ? "Save Changes" : "Add Trip"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      {children}
    </div>
  );
}

function PreviewRow({
  label,
  value,
  strong,
  accent,
}: {
  label: string;
  value: number;
  strong?: boolean;
  accent?: "success";
}) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span
        className={[
          "tabular",
          strong ? "text-base font-semibold" : "font-medium",
          accent === "success" ? "text-success" : "",
          strong && value < 0 ? "text-destructive" : "",
          strong && value >= 0 ? "text-success" : "",
        ].join(" ")}
      >
        {formatPKR(value)}
      </span>
    </div>
  );
}
