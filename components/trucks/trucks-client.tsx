"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  Plus,
  Pencil,
  Trash2,
  Search,
  Truck as TruckIcon,
  Scale,
  Banknote,
  TrendingUp,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { useToast } from "@/components/ui/toast";
import { TruckForm } from "./truck-form";
import { computeTruckRow, computeTotals } from "@/lib/calculations";
import { formatPKR, formatDate, formatTons } from "@/lib/format";
import { deleteTruck } from "@/lib/actions";
import type { Truck, Settings } from "@/db/schema";

export function TrucksClient({
  trucks,
  settings,
}: {
  trucks: Truck[];
  settings: Settings;
}) {
  const router = useRouter();
  const { toast } = useToast();
  const [query, setQuery] = React.useState("");
  const [material, setMaterial] = React.useState<"all" | "100-I" | "100-W">("all");
  const [formOpen, setFormOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<Truck | undefined>(undefined);
  const [deleteTarget, setDeleteTarget] = React.useState<Truck | null>(null);

  const filtered = trucks.filter((t) => {
    if (material !== "all" && t.materialType !== material) return false;
    if (query) {
      const q = query.toLowerCase();
      return (
        t.truckNumber.toLowerCase().includes(q) ||
        (t.driverName ?? "").toLowerCase().includes(q)
      );
    }
    return true;
  });

  const totals = computeTotals(filtered);

  function openAdd() {
    setEditing(undefined);
    setFormOpen(true);
  }
  function openEdit(t: Truck) {
    setEditing(t);
    setFormOpen(true);
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    const res = await deleteTruck(deleteTarget.id);
    if (res.ok) {
      toast("Truck trip deleted.", "success");
      router.refresh();
    } else {
      toast(res.error, "error");
    }
  }

  return (
    <div className="space-y-4">
      {/* Summary strip */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4 stagger">
        <MiniStat label="Trips" value={String(totals.truckCount)} icon={TruckIcon} />
        <MiniStat label="Tons" value={formatTons(totals.totalTons)} icon={Scale} />
        <MiniStat
          label="Revenue"
          value={formatPKR(totals.salesRevenue, { compact: true })}
          icon={Banknote}
        />
        <MiniStat
          label="Net Profit"
          value={formatPKR(totals.netProfit, { compact: true })}
          tone="positive"
          icon={TrendingUp}
        />
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-1 flex-col gap-2 sm:flex-row">
              <div className="relative flex-1 sm:max-w-xs">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search truck or driver…"
                  className="pl-9"
                />
              </div>
              <Select
                value={material}
                onChange={(e) => setMaterial(e.target.value as typeof material)}
                className="sm:w-40"
              >
                <option value="all">All materials</option>
                <option value="100-I">100-I</option>
                <option value="100-W">100-W</option>
              </Select>
            </div>
            <Button onClick={openAdd}>
              <Plus className="h-4 w-4" /> Add Trip
            </Button>
          </div>

          <div className="mt-4">
            {filtered.length === 0 ? (
              <EmptyState
                icon={TruckIcon}
                title={query || material !== "all" ? "No matching trips" : "No truck trips yet"}
                description={
                  query || material !== "all"
                    ? "Try adjusting your search or material filter."
                    : "Add your first trip to start tracking profit and transport savings."
                }
                action={
                  <Button onClick={openAdd}>
                    <Plus className="h-4 w-4" /> Add Trip
                  </Button>
                }
              />
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Truck</TableHead>
                    <TableHead>Driver</TableHead>
                    <TableHead>Material</TableHead>
                    <TableHead className="text-right">Tons</TableHead>
                    <TableHead className="text-right">Revenue</TableHead>
                    <TableHead className="text-right">Transport Saving</TableHead>
                    <TableHead className="text-right">Net Profit</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((t) => {
                    const f = computeTruckRow(t);
                    return (
                      <TableRow key={t.id}>
                        <TableCell className="whitespace-nowrap text-muted-foreground">
                          {formatDate(t.date)}
                        </TableCell>
                        <TableCell className="font-medium">{t.truckNumber}</TableCell>
                        <TableCell className="text-muted-foreground">
                          {t.driverName || "—"}
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">{t.materialType}</Badge>
                        </TableCell>
                        <TableCell className="text-right tabular">
                          {formatTons(f.tons)}
                        </TableCell>
                        <TableCell className="text-right tabular">
                          {formatPKR(f.salesRevenue)}
                        </TableCell>
                        <TableCell className="text-right tabular text-chart-5">
                          {formatPKR(f.transportSavings)}
                        </TableCell>
                        <TableCell className="text-right tabular font-semibold text-success">
                          {formatPKR(f.netProfit)}
                        </TableCell>
                        <TableCell>
                          <div className="flex justify-end gap-1">
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-8 w-8"
                              onClick={() => openEdit(t)}
                              aria-label="Edit"
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-8 w-8 text-destructive hover:text-destructive"
                              onClick={() => setDeleteTarget(t)}
                              aria-label="Delete"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
                <TableFooter>
                  <TableRow>
                    <TableCell colSpan={4} className="font-medium">
                      Total ({totals.truckCount})
                    </TableCell>
                    <TableCell className="text-right tabular font-medium">
                      {formatTons(totals.totalTons)}
                    </TableCell>
                    <TableCell className="text-right tabular font-medium">
                      {formatPKR(totals.salesRevenue)}
                    </TableCell>
                    <TableCell className="text-right tabular font-medium text-chart-5">
                      {formatPKR(totals.transportSavings)}
                    </TableCell>
                    <TableCell className="text-right tabular font-semibold text-success">
                      {formatPKR(totals.netProfit)}
                    </TableCell>
                    <TableCell />
                  </TableRow>
                </TableFooter>
              </Table>
            )}
          </div>
        </CardContent>
      </Card>

      <TruckForm
        open={formOpen}
        onOpenChange={setFormOpen}
        settings={settings}
        truck={editing}
      />
      <ConfirmDialog
        open={deleteTarget !== null}
        onOpenChange={(o) => !o && setDeleteTarget(null)}
        title="Delete truck trip?"
        description={`This will permanently remove trip ${deleteTarget?.truckNumber ?? ""}.`}
        confirmLabel="Delete"
        onConfirm={confirmDelete}
      />
    </div>
  );
}

function MiniStat({
  label,
  value,
  tone,
  icon: Icon,
}: {
  label: string;
  value: string;
  tone?: "positive";
  icon?: LucideIcon;
}) {
  return (
    <Card className="flex items-center gap-3 p-4 card-elevated">
      {Icon && (
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Icon className="h-5 w-5" />
        </span>
      )}
      <div className="min-w-0">
        <p className="text-xs font-medium text-muted-foreground">{label}</p>
        <p
          className={`mt-0.5 text-lg font-semibold tabular ${
            tone === "positive" ? "text-success" : ""
          }`}
        >
          {value}
        </p>
      </div>
    </Card>
  );
}
