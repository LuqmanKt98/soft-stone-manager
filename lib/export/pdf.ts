import type { ReportData } from "./types";
import { computeTruckRow } from "@/lib/calculations";
import { formatDate } from "@/lib/format";

function money(v: number): string {
  return (
    "PKR " +
    Math.round(v).toLocaleString("en-PK", { maximumFractionDigits: 0 })
  );
}

const BRAND: [number, number, number] = [42, 120, 214]; // --chart-1
const INK: [number, number, number] = [11, 11, 11];
const MUTED: [number, number, number] = [110, 110, 105];

export async function exportReportPDF(data: ReportData) {
  const { jsPDF } = await import("jspdf");
  const autoTable = (await import("jspdf-autotable")).default;

  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 40;

  // Header band
  doc.setFillColor(...BRAND);
  doc.rect(0, 0, pageWidth, 70, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.text(data.businessName, margin, 32);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.text("Business Report", margin, 50);
  doc.setFontSize(9);
  doc.text(`Generated: ${data.generatedAt}`, pageWidth - margin, 32, { align: "right" });
  doc.text(data.rangeLabel, pageWidth - margin, 50, { align: "right" });

  let y = 96;
  doc.setTextColor(...INK);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.text("Financial Summary", margin, y);
  y += 8;

  const t = data.totals;
  const summaryRows: [string, string][] = [
    ["Selling Revenue", money(t.salesRevenue)],
    ["Purchase Cost", money(t.purchaseCost)],
    ["Gross Profit", money(t.grossProfit)],
    ["Transport Cost (company rate)", money(t.transportCost)],
    ["Transport Paid (actual)", money(t.transportPaid)],
    ["Transport Savings", money(t.transportSavings)],
    ["Loading / Boarding / Other", money(t.additionalExpenses)],
    ["Net Profit", money(t.netProfit)],
    ["Payments Received (period)", money(data.paymentsReceived)],
    ["Outstanding (all-time)", money(data.overallOutstanding)],
    ["Total Tons Delivered", t.totalTons.toLocaleString("en-PK") + " t"],
    ["Total Truck Trips", String(t.truckCount)],
  ];

  autoTable(doc, {
    startY: y,
    body: summaryRows,
    theme: "plain",
    styles: { fontSize: 10, cellPadding: 4, textColor: INK },
    columnStyles: {
      0: { textColor: MUTED, cellWidth: 240 },
      1: { fontStyle: "bold", halign: "right" },
    },
    margin: { left: margin, right: margin },
  });

  // Material summary
  if (data.material.length) {
    autoTable(doc, {
      startY: (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 20,
      head: [["Material", "Trips", "Tons", "Revenue", "Net Profit"]],
      body: data.material.map((m) => [
        m.material,
        String(m.trucks),
        m.tons.toLocaleString("en-PK"),
        money(m.revenue),
        money(m.netProfit),
      ]),
      headStyles: { fillColor: BRAND, textColor: 255, fontSize: 10 },
      styles: { fontSize: 9, cellPadding: 5 },
      columnStyles: {
        1: { halign: "right" },
        2: { halign: "right" },
        3: { halign: "right" },
        4: { halign: "right" },
      },
      margin: { left: margin, right: margin },
      didDrawPage: () => {
        doc.setFontSize(12);
        doc.setTextColor(...INK);
        doc.setFont("helvetica", "bold");
      },
    });
  }

  // Truck summary
  if (data.trucks.length) {
    autoTable(doc, {
      startY: (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 20,
      head: [["Date", "Truck", "Material", "Tons", "Revenue", "Savings", "Net Profit"]],
      body: data.trucks.map((tr) => {
        const f = computeTruckRow(tr);
        return [
          formatDate(tr.date),
          tr.truckNumber,
          tr.materialType,
          f.tons.toLocaleString("en-PK"),
          money(f.salesRevenue),
          money(f.transportSavings),
          money(f.netProfit),
        ];
      }),
      headStyles: { fillColor: BRAND, textColor: 255, fontSize: 9 },
      styles: { fontSize: 8, cellPadding: 4 },
      columnStyles: {
        3: { halign: "right" },
        4: { halign: "right" },
        5: { halign: "right" },
        6: { halign: "right" },
      },
      margin: { left: margin, right: margin },
    });
  }

  // Payment history
  if (data.payments.length) {
    autoTable(doc, {
      startY: (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 20,
      head: [["Date", "Method", "Reference", "Amount"]],
      body: data.payments.map((p) => [
        formatDate(p.date),
        p.method,
        p.reference || "-",
        money(Number(p.amount)),
      ]),
      headStyles: { fillColor: BRAND, textColor: 255, fontSize: 9 },
      styles: { fontSize: 9, cellPadding: 5 },
      columnStyles: { 3: { halign: "right" } },
      margin: { left: margin, right: margin },
    });
  }

  // Footer page numbers
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(...MUTED);
    doc.text(
      `Page ${i} of ${pageCount}`,
      pageWidth - margin,
      doc.internal.pageSize.getHeight() - 20,
      { align: "right" },
    );
    doc.text(
      "Soft Stone Manager",
      margin,
      doc.internal.pageSize.getHeight() - 20,
    );
  }

  doc.save(`soft-stone-report-${data.start}-to-${data.end}.pdf`);
}
