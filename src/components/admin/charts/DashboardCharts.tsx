"use client";

import type { EChartsOption } from "echarts";
import { EChart } from "./EChart";

const AMBER = ["#b45309", "#d97706", "#f59e0b", "#fbbf24", "#fde68a"];
const STONE_TEXT = "#57534e";
const STONE_LINE = "#e7e5e4";

const baseTextStyle = { color: STONE_TEXT, fontFamily: "inherit" };

export type SalesTrendPoint = { date: string; amount: number };
export type StatusDistItem = { label: string; count: number };
export type TierDistItem = { label: string; count: number };
export type CategoryCountItem = { name: string; count: number };

type Props = {
  salesTrend: SalesTrendPoint[];
  statusDist: StatusDistItem[];
  tierDist: TierDistItem[];
  categoryCounts: CategoryCountItem[];
};

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
      <h3 className="text-sm font-semibold text-stone-700">{title}</h3>
      <div className="mt-3 h-72">{children}</div>
    </div>
  );
}

export function DashboardCharts({ salesTrend, statusDist, tierDist, categoryCounts }: Props) {
  const salesOption: EChartsOption = {
    textStyle: baseTextStyle,
    grid: { left: 48, right: 16, top: 24, bottom: 32 },
    tooltip: { trigger: "axis", valueFormatter: (v) => `¥${Number(v).toFixed(2)}` },
    xAxis: {
      type: "category",
      data: salesTrend.map((p) => p.date),
      axisLine: { lineStyle: { color: STONE_LINE } },
      axisLabel: { color: STONE_TEXT },
    },
    yAxis: {
      type: "value",
      axisLine: { show: false },
      splitLine: { lineStyle: { color: STONE_LINE } },
      axisLabel: { color: STONE_TEXT },
    },
    series: [
      {
        type: "line",
        data: salesTrend.map((p) => p.amount),
        smooth: true,
        symbol: "circle",
        symbolSize: 6,
        lineStyle: { color: AMBER[0], width: 2 },
        itemStyle: { color: AMBER[0] },
        areaStyle: { color: "rgba(180, 83, 9, 0.1)" },
      },
    ],
  };

  const statusOption: EChartsOption = {
    textStyle: baseTextStyle,
    tooltip: { trigger: "item" },
    legend: { bottom: 0, textStyle: { color: STONE_TEXT } },
    series: [
      {
        type: "pie",
        radius: ["45%", "70%"],
        center: ["50%", "45%"],
        color: AMBER,
        label: { color: STONE_TEXT },
        data: statusDist.map((d) => ({ name: d.label, value: d.count })),
      },
    ],
  };

  const tierOption: EChartsOption = {
    textStyle: baseTextStyle,
    tooltip: { trigger: "item" },
    legend: { bottom: 0, textStyle: { color: STONE_TEXT } },
    series: [
      {
        type: "pie",
        radius: ["45%", "70%"],
        center: ["50%", "45%"],
        color: AMBER,
        label: { color: STONE_TEXT },
        data: tierDist.map((d) => ({ name: d.label, value: d.count })),
      },
    ],
  };

  const categoryOption: EChartsOption = {
    textStyle: baseTextStyle,
    grid: { left: 48, right: 16, top: 24, bottom: 48 },
    tooltip: { trigger: "axis" },
    xAxis: {
      type: "category",
      data: categoryCounts.map((c) => c.name),
      axisLine: { lineStyle: { color: STONE_LINE } },
      axisLabel: { color: STONE_TEXT, interval: 0, rotate: categoryCounts.length > 4 ? 20 : 0 },
    },
    yAxis: {
      type: "value",
      axisLine: { show: false },
      splitLine: { lineStyle: { color: STONE_LINE } },
      axisLabel: { color: STONE_TEXT },
    },
    series: [
      {
        type: "bar",
        data: categoryCounts.map((c) => c.count),
        itemStyle: { color: AMBER[0], borderRadius: [4, 4, 0, 0] },
        barMaxWidth: 40,
      },
    ],
  };

  return (
    <div className="mt-8 grid grid-cols-1 gap-4 lg:grid-cols-2">
      <ChartCard title="销售趋势（近30天）">
        <EChart option={salesOption} className="h-full w-full" />
      </ChartCard>
      <ChartCard title="订单状态分布">
        <EChart option={statusOption} className="h-full w-full" />
      </ChartCard>
      <ChartCard title="会员等级分布">
        <EChart option={tierOption} className="h-full w-full" />
      </ChartCard>
      <ChartCard title="分类商品数量">
        <EChart option={categoryOption} className="h-full w-full" />
      </ChartCard>
    </div>
  );
}
