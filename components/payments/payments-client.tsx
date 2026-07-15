"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { StatCard } from "@/components/dashboard/stat-card";
import { useToast } from "@/components/ui/toast";
import { PaymentForm } from "./payment-form";
import { formatPKR, formatDate } from "@/lib/format";
import { deletePayment } from "@/lib/actions";
import type { Payment } from "@/db/schema";
import { Banknote, Receipt, TrendingUp } from "lucide-react";

export function PaymentsClient({
  payments,
  billed,
  received,
}: {
  payments: Payment[];
  billed: number;
  received: number;
}) {
  const router = useRouter();
  const { toast } = useToast();
  const [formOpen, setFormOpen] = React.useState(false);
  const [deleteTarget, setDeleteTarget] = React.useState<Payment | null>(null);

  const outstanding = billed - received;
  const pct = billed > 0 ? Math.min(100, (received / billed) * 100) : 0;

  async function confirmDelete() {
    if (!deleteTarget) return;
    const res = await deletePayment(deleteTarget.id);
    if (res.ok) {
      toast("Payment deleted.", "success");
      router.refresh();
    } else {
      toast(res.error, "error");
    }
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <StatCard
          label="Total Billed"
          value={formatPKR(billed)}
          icon={Banknote}
          accent="primary"
          hint="Value of stone supplied"
        />
        <StatCard
          label="Payments Received"
          value={formatPKR(received)}
          icon={TrendingUp}
          accent="chart-2"
          hint={`${pct.toFixed(0)}% collected`}
        />
        <StatCard
          label="Outstanding Balance"
          value={formatPKR(outstanding)}
          icon={Receipt}
          accent={outstanding > 0 ? "chart-6" : "success"}
          hint="Remaining receivable"
        />
      </div>

      {/* Collection progress */}
      <Card>
        <CardContent className="p-5">
          <div className="mb-2 flex items-center justify-between text-sm">
            <span className="font-medium">Collection progress</span>
            <span className="tabular text-muted-foreground">
              {formatPKR(received)} / {formatPKR(billed)}
            </span>
          </div>
          <div className="h-3 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-chart-2 transition-all"
              style={{ width: `${pct}%` }}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex-row items-center justify-between space-y-0">
          <CardTitle>Payment History</CardTitle>
          <Button onClick={() => setFormOpen(true)}>
            <Plus className="h-4 w-4" /> Record Payment
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          {payments.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-16 text-center">
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                <Wallet className="h-6 w-6 text-muted-foreground" />
              </span>
              <div>
                <p className="font-medium">No payments recorded</p>
                <p className="text-sm text-muted-foreground">
                  Record a payment when the company pays.
                </p>
              </div>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead>Reference</TableHead>
                  <TableHead>Notes</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payments.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell className="whitespace-nowrap text-muted-foreground">
                      {formatDate(p.date)}
                    </TableCell>
                    <TableCell>
                      <Badge variant="muted">{p.method}</Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {p.reference || "—"}
                    </TableCell>
                    <TableCell className="max-w-[200px] truncate text-muted-foreground">
                      {p.notes || "—"}
                    </TableCell>
                    <TableCell className="text-right tabular font-semibold text-chart-2">
                      {formatPKR(Number(p.amount))}
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-end">
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 text-destructive hover:text-destructive"
                          onClick={() => setDeleteTarget(p)}
                          aria-label="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <PaymentForm open={formOpen} onOpenChange={setFormOpen} outstanding={outstanding} />
      <ConfirmDialog
        open={deleteTarget !== null}
        onOpenChange={(o) => !o && setDeleteTarget(null)}
        title="Delete payment?"
        description={`Remove payment of ${
          deleteTarget ? formatPKR(Number(deleteTarget.amount)) : ""
        }.`}
        confirmLabel="Delete"
        onConfirm={confirmDelete}
      />
    </div>
  );
}
