"use client";

import * as React from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import { formatCompact, formatPKR } from "@/lib/format";

export interface SeriesConfig {
  key: string;
  name: string;
  color: string; // CSS color / var
}

const AXIS = "var(--chart-axis)";
const GRID = "var(--chart-grid)";

const axisProps = {
  tick: { fontSize: 11, fill: AXIS },
  tickLine: false,
  axisLine: false,
} as const;

function CurrencyTooltip({
  active,
  payload,
  label,
  formatter,
}: {
  active?: boolean;
  payload?: Array<{ dataKey?: string | number; name?: string; value?: number; color?: string }>;
  label?: string;
  formatter?: (v: number) => string;
}) {
  if (!active || !payload?.length) return null;
  const fmt = formatter ?? ((v: number) => formatPKR(v, { compact: true }));
  return (
    <div className="rounded-lg border border-border bg-popover px-3 py-2 text-xs shadow-lg">
      {label != null && (
        <p className="mb-1.5 font-medium text-foreground">{label}</p>
      )}
      <div className="space-y-1">
        {payload.map((p, i) => (
          <div key={i} className="flex items-center justify-between gap-6">
            <span className="flex items-center gap-1.5 text-muted-foreground">
              <span
                className="inline-block h-2 w-2 rounded-full"
                style={{ background: p.color }}
              />
              {p.name}
            </span>
            <span className="tabular font-medium text-foreground">
              {fmt(Number(p.value) || 0)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function legendFormatter(value: string) {
  return <span className="text-xs text-muted-foreground">{value}</span>;
}

const currencyTick = (v: number) => formatCompact(v);

export function AreaTrend({
  data,
  xKey,
  series,
  height = 300,
  formatter,
}: {
  data: Record<string, unknown>[];
  xKey: string;
  series: SeriesConfig[];
  height?: number;
  formatter?: (v: number) => string;
}) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ top: 8, right: 8, left: 4, bottom: 0 }}>
        <defs>
          {series.map((s) => (
            <linearGradient
              key={s.key}
              id={`grad-${s.key}`}
              x1="0"
              y1="0"
              x2="0"
              y2="1"
            >
              <stop offset="0%" stopColor={s.color} stopOpacity={0.28} />
              <stop offset="100%" stopColor={s.color} stopOpacity={0.02} />
            </linearGradient>
          ))}
        </defs>
        <CartesianGrid stroke={GRID} vertical={false} />
        <XAxis dataKey={xKey} {...axisProps} minTickGap={16} />
        <YAxis {...axisProps} width={46} tickFormatter={currencyTick} />
        <Tooltip
          content={<CurrencyTooltip formatter={formatter} />}
          cursor={{ stroke: AXIS, strokeWidth: 1 }}
        />
        {series.length > 1 && (
          <Legend formatter={legendFormatter} iconType="circle" iconSize={8} />
        )}
        {series.map((s) => (
          <Area
            key={s.key}
            type="monotone"
            dataKey={s.key}
            name={s.name}
            stroke={s.color}
            strokeWidth={2}
            fill={`url(#grad-${s.key})`}
            dot={false}
            activeDot={{ r: 4, strokeWidth: 0 }}
          />
        ))}
      </AreaChart>
    </ResponsiveContainer>
  );
}

export function LineTrend({
  data,
  xKey,
  series,
  height = 300,
  formatter,
}: {
  data: Record<string, unknown>[];
  xKey: string;
  series: SeriesConfig[];
  height?: number;
  formatter?: (v: number) => string;
}) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data} margin={{ top: 8, right: 8, left: 4, bottom: 0 }}>
        <CartesianGrid stroke={GRID} vertical={false} />
        <XAxis dataKey={xKey} {...axisProps} minTickGap={16} />
        <YAxis {...axisProps} width={46} tickFormatter={currencyTick} />
        <Tooltip
          content={<CurrencyTooltip formatter={formatter} />}
          cursor={{ stroke: AXIS, strokeWidth: 1 }}
        />
        {series.length > 1 && (
          <Legend formatter={legendFormatter} iconType="circle" iconSize={8} />
        )}
        {series.map((s) => (
          <Line
            key={s.key}
            type="monotone"
            dataKey={s.key}
            name={s.name}
            stroke={s.color}
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4, strokeWidth: 0 }}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
}

export function Bars({
  data,
  xKey,
  series,
  height = 300,
  stacked = false,
  formatter,
}: {
  data: Record<string, unknown>[];
  xKey: string;
  series: SeriesConfig[];
  height?: number;
  stacked?: boolean;
  formatter?: (v: number) => string;
}) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ top: 8, right: 8, left: 4, bottom: 0 }} barGap={2}>
        <CartesianGrid stroke={GRID} vertical={false} />
        <XAxis dataKey={xKey} {...axisProps} minTickGap={8} />
        <YAxis {...axisProps} width={46} tickFormatter={currencyTick} />
        <Tooltip
          content={<CurrencyTooltip formatter={formatter} />}
          cursor={{ fill: "var(--muted)", opacity: 0.5 }}
        />
        {series.length > 1 && (
          <Legend formatter={legendFormatter} iconType="circle" iconSize={8} />
        )}
        {series.map((s) => (
          <Bar
            key={s.key}
            dataKey={s.key}
            name={s.name}
            fill={s.color}
            stackId={stacked ? "a" : undefined}
            radius={stacked ? undefined : [4, 4, 0, 0]}
            maxBarSize={48}
          />
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
}

export interface DonutDatum {
  name: string;
  value: number;
  color: string;
}

export function Donut({
  data,
  height = 260,
  centerLabel,
  centerValue,
  formatter,
}: {
  data: DonutDatum[];
  height?: number;
  centerLabel?: string;
  centerValue?: string;
  formatter?: (v: number) => string;
}) {
  const fmt = formatter ?? ((v: number) => formatPKR(v, { compact: true }));
  return (
    <div className="relative">
      <ResponsiveContainer width="100%" height={height}>
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            innerRadius="62%"
            outerRadius="88%"
            paddingAngle={2}
            stroke="var(--card)"
            strokeWidth={2}
          >
            {data.map((d) => (
              <Cell key={d.name} fill={d.color} />
            ))}
          </Pie>
          <Tooltip
            content={({ active, payload }) => {
              if (!active || !payload?.length) return null;
              const p = payload[0];
              return (
                <div className="rounded-lg border border-border bg-popover px-3 py-2 text-xs shadow-lg">
                  <span className="flex items-center gap-1.5">
                    <span
                      className="inline-block h-2 w-2 rounded-full"
                      style={{ background: (p.payload as DonutDatum).color }}
                    />
                    <span className="text-muted-foreground">{p.name}</span>
                    <span className="tabular ml-2 font-medium text-foreground">
                      {fmt(Number(p.value) || 0)}
                    </span>
                  </span>
                </div>
              );
            }}
          />
        </PieChart>
      </ResponsiveContainer>
      {(centerValue || centerLabel) && (
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          {centerValue && (
            <span className="text-xl font-semibold tabular">{centerValue}</span>
          )}
          {centerLabel && (
            <span className="text-xs text-muted-foreground">{centerLabel}</span>
          )}
        </div>
      )}
    </div>
  );
}

/** Simple horizontal legend for donuts / pies with values. */
export function ChartLegend({ items }: { items: DonutDatum[] }) {
  return (
    <ul className="flex flex-wrap gap-x-4 gap-y-2">
      {items.map((it) => (
        <li key={it.name} className="flex items-center gap-1.5 text-xs">
          <span
            className="inline-block h-2.5 w-2.5 rounded-full"
            style={{ background: it.color }}
          />
          <span className="text-muted-foreground">{it.name}</span>
        </li>
      ))}
    </ul>
  );
}

export const CHART_COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
  "var(--chart-6)",
  "var(--chart-7)",
  "var(--chart-8)",
];
