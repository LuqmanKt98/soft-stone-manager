"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Loader2, Save, Trash2, Info } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { useToast } from "@/components/ui/toast";
import { updateSettings, clearAllData } from "@/lib/actions";
import type { Settings } from "@/db/schema";

export function SettingsClient({ settings }: { settings: Settings }) {
  const router = useRouter();
  const { toast } = useToast();
  const [saving, setSaving] = React.useState(false);
  const [clearOpen, setClearOpen] = React.useState(false);
  const [form, setForm] = React.useState({
    businessName: settings.businessName,
    purchaseRate: settings.purchaseRate,
    sellingRate: settings.sellingRate,
    companyRentalRate: settings.companyRentalRate,
    actualRentalRate: settings.actualRentalRate,
  });

  const set = (k: keyof typeof form, v: string) => setForm((f) => ({ ...f, [k]: v }));

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const res = await updateSettings(form);
    setSaving(false);
    if (res.ok) {
      toast("Settings saved.", "success");
      router.refresh();
    } else {
      toast(res.error, "error");
    }
  }

  async function handleClear() {
    const res = await clearAllData();
    if (res.ok) {
      toast("All truck trips and payments cleared.", "success");
      router.refresh();
    } else {
      toast(res.error, "error");
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="lg:col-span-2 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Business & Default Rates</CardTitle>
            <CardDescription>
              These defaults pre-fill every new truck trip. You can still override
              them per trip.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={save} className="space-y-4">
              <div className="space-y-1.5">
                <Label>Business Name</Label>
                <Input
                  value={form.businessName}
                  onChange={(e) => set("businessName", e.target.value)}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>Purchase Rate (PKR / ton)</Label>
                  <Input
                    type="number"
                    value={form.purchaseRate}
                    onChange={(e) => set("purchaseRate", e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Selling Rate (PKR / ton)</Label>
                  <Input
                    type="number"
                    value={form.sellingRate}
                    onChange={(e) => set("sellingRate", e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Company Rental Rate (PKR / ton)</Label>
                  <Input
                    type="number"
                    value={form.companyRentalRate}
                    onChange={(e) => set("companyRentalRate", e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Actual Rental Rate (PKR / ton)</Label>
                  <Input
                    type="number"
                    value={form.actualRentalRate}
                    onChange={(e) => set("actualRentalRate", e.target.value)}
                  />
                </div>
              </div>
              <Button type="submit" disabled={saving}>
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                Save Settings
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="border-destructive/30">
          <CardHeader>
            <CardTitle className="text-destructive">Danger Zone</CardTitle>
            <CardDescription>
              Permanently delete all truck trips and payments. Settings are kept.
              This cannot be undone.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="destructive" onClick={() => setClearOpen(true)}>
              <Trash2 className="h-4 w-4" /> Clear All Data
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card className="h-fit">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-4 w-4 text-primary" /> How profit is calculated
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-muted-foreground">
          <Formula label="Purchase Cost" body="Tons × Purchase Rate" />
          <Formula label="Sales Revenue" body="Tons × Selling Rate" />
          <Formula label="Gross Profit" body="Sales Revenue − Purchase Cost" />
          <Formula label="Transport Cost" body="Tons × Company Rental Rate" />
          <Formula label="Transport Savings" body="Tons × (Company − Actual Rate)" />
          <Formula
            label="Net Profit"
            body="Gross Profit + Transport Savings − Loading − Boarding − Other"
          />
          <p className="pt-2 text-xs">
            Transport is billed at the company rate, so the negotiated saving adds
            to profit. If your arrangement differs, adjust the rates per trip.
          </p>
        </CardContent>
      </Card>

      <ConfirmDialog
        open={clearOpen}
        onOpenChange={setClearOpen}
        title="Clear all data?"
        description="This permanently deletes every truck trip and payment. This cannot be undone."
        confirmLabel="Yes, clear everything"
        onConfirm={handleClear}
      />
    </div>
  );
}

function Formula({ label, body }: { label: string; body: string }) {
  return (
    <div className="rounded-md bg-muted/50 px-3 py-2">
      <p className="font-medium text-foreground">{label}</p>
      <p className="tabular text-xs">{body}</p>
    </div>
  );
}
