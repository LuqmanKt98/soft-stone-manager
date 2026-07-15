/** Formatting helpers for currency, numbers, and dates (PKR / en-PK). */

export function formatPKR(value: number, opts?: { compact?: boolean }): string {
  if (value == null || Number.isNaN(value)) return "PKR 0";
  if (opts?.compact) {
    return "PKR " + formatCompact(value);
  }
  return (
    "PKR " +
    value.toLocaleString("en-PK", {
      maximumFractionDigits: 0,
    })
  );
}

/** Compact form: 2,200,000 -> 2.2M, 45,000 -> 45.0K */
export function formatCompact(value: number): string {
  const abs = Math.abs(value);
  const sign = value < 0 ? "-" : "";
  if (abs >= 1_000_000_000) return `${sign}${(abs / 1_000_000_000).toFixed(2)}B`;
  if (abs >= 1_000_000) return `${sign}${(abs / 1_000_000).toFixed(2)}M`;
  if (abs >= 1_000) return `${sign}${(abs / 1_000).toFixed(1)}K`;
  return `${sign}${abs.toFixed(0)}`;
}

export function formatNumber(value: number, decimals = 0): string {
  if (value == null || Number.isNaN(value)) return "0";
  return value.toLocaleString("en-PK", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

export function formatTons(value: number): string {
  return `${formatNumber(value, value % 1 === 0 ? 0 : 2)} t`;
}

/** yyyy-mm-dd (local) — the storage format for date columns. */
export function toISODate(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/** Parse a yyyy-mm-dd date string as a local date (avoids TZ shift). */
export function parseISODate(s: string): Date {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y, (m ?? 1) - 1, d ?? 1);
}

export function formatDate(s: string | Date): string {
  const d = typeof s === "string" ? parseISODate(s) : s;
  return d.toLocaleDateString("en-PK", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function formatDateShort(s: string | Date): string {
  const d = typeof s === "string" ? parseISODate(s) : s;
  return d.toLocaleDateString("en-PK", { day: "2-digit", month: "short" });
}
