import type { ReportData } from "./types";
import { computeTruckRow } from "@/lib/calculations";

const HEADER_FILL = "FF2A78D6";
const MONEY_FMT = '#,##0';

function downloadBlob(buffer: ArrayBuffer, filename: string) {
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export async function exportReportExcel(data: ReportData) {
  const ExcelJS = (await import("exceljs")).default;
  const wb = new ExcelJS.Workbook();
  wb.creator = "Soft Stone Manager";
  wb.created = new Date();

  const styleHeader = (row: import("exceljs").Row) => {
    row.eachCell((cell) => {
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: HEADER_FILL },
      };
      cell.font = { bold: true, color: { argb: "FFFFFFFF" } };
      cell.alignment = { vertical: "middle" };
    });
  };

  // ── Summary sheet ──
  const s = wb.addWorksheet("Summary");
  s.columns = [
    { width: 34 },
    { width: 22 },
  ];
  s.mergeCells("A1:B1");
  s.getCell("A1").value = data.businessName + " — Business Report";
  s.getCell("A1").font = { bold: true, size: 14 };
  s.getCell("A2").value = data.rangeLabel;
  s.getCell("A3").value = "Generated: " + data.generatedAt;
  s.getCell("A3").font = { color: { argb: "FF888781" } };

  const t = data.totals;
  const summary: [string, number | string][] = [
    ["Selling Revenue", t.salesRevenue],
    ["Purchase Cost", t.purchaseCost],
    ["Gross Profit", t.grossProfit],
    ["Transport Cost (company rate)", t.transportCost],
    ["Transport Paid (actual)", t.transportPaid],
    ["Transport Savings", t.transportSavings],
    ["Loading / Boarding / Other", t.additionalExpenses],
    ["Net Profit", t.netProfit],
    ["Payments Received (period)", data.paymentsReceived],
    ["Outstanding (all-time)", data.overallOutstanding],
    ["Total Tons Delivered", Number(t.totalTons.toFixed(2))],
    ["Total Truck Trips", t.truckCount],
  ];
  let r = 5;
  for (const [label, value] of summary) {
    s.getCell(`A${r}`).value = label;
    const vc = s.getCell(`B${r}`);
    vc.value = value;
    if (typeof value === "number" && label !== "Total Truck Trips" && !label.startsWith("Total Tons")) {
      vc.numFmt = MONEY_FMT;
    }
    vc.font = { bold: true };
    r++;
  }

  // ── Trucks sheet ──
  const ts = wb.addWorksheet("Trucks");
  ts.columns = [
    { header: "Date", key: "date", width: 12 },
    { header: "Truck", key: "truck", width: 14 },
    { header: "Driver", key: "driver", width: 14 },
    { header: "Material", key: "material", width: 10 },
    { header: "Tons", key: "tons", width: 10 },
    { header: "Purchase Cost", key: "purchase", width: 15 },
    { header: "Revenue", key: "revenue", width: 15 },
    { header: "Transport Paid", key: "transport", width: 15 },
    { header: "Transport Savings", key: "savings", width: 16 },
    { header: "Add. Expenses", key: "addexp", width: 14 },
    { header: "Net Profit", key: "net", width: 15 },
  ];
  styleHeader(ts.getRow(1));
  for (const tr of data.trucks) {
    const f = computeTruckRow(tr);
    ts.addRow({
      date: tr.date,
      truck: tr.truckNumber,
      driver: tr.driverName || "",
      material: tr.materialType,
      tons: f.tons,
      purchase: f.purchaseCost,
      revenue: f.salesRevenue,
      transport: f.transportPaid,
      savings: f.transportSavings,
      addexp: f.additionalExpenses,
      net: f.netProfit,
    });
  }
  ["F", "G", "H", "I", "J", "K"].forEach((col) => {
    ts.getColumn(col).numFmt = MONEY_FMT;
  });

  // ── Payments sheet ──
  const ps = wb.addWorksheet("Payments");
  ps.columns = [
    { header: "Date", key: "date", width: 12 },
    { header: "Method", key: "method", width: 16 },
    { header: "Reference", key: "reference", width: 22 },
    { header: "Notes", key: "notes", width: 28 },
    { header: "Amount", key: "amount", width: 16 },
  ];
  styleHeader(ps.getRow(1));
  for (const p of data.payments) {
    ps.addRow({
      date: p.date,
      method: p.method,
      reference: p.reference || "",
      notes: p.notes || "",
      amount: Number(p.amount),
    });
  }
  ps.getColumn("E").numFmt = MONEY_FMT;

  // ── Material sheet ──
  const ms = wb.addWorksheet("Material");
  ms.columns = [
    { header: "Material", key: "material", width: 14 },
    { header: "Trips", key: "trips", width: 10 },
    { header: "Tons", key: "tons", width: 12 },
    { header: "Revenue", key: "revenue", width: 16 },
    { header: "Net Profit", key: "net", width: 16 },
  ];
  styleHeader(ms.getRow(1));
  for (const m of data.material) {
    ms.addRow({
      material: m.material,
      trips: m.trucks,
      tons: Number(m.tons.toFixed(2)),
      revenue: m.revenue,
      net: m.netProfit,
    });
  }
  ["D", "E"].forEach((c) => (ms.getColumn(c).numFmt = MONEY_FMT));

  const buffer = await wb.xlsx.writeBuffer();
  downloadBlob(buffer as ArrayBuffer, `soft-stone-report-${data.start}-to-${data.end}.xlsx`);
}
