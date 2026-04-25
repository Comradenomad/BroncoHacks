"use client"

import { Doughnut } from "react-chartjs-2"
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js"

ChartJS.register(ArcElement, Tooltip, Legend)

interface MaterialStat {
  material: string
  totalWeight: number
  totalPoints: number
  count: number
}

interface MaterialChartProps {
  data: MaterialStat[]
}

const MATERIAL_COLORS: Record<string, { bg: string; border: string }> = {
  plastic: { bg: "rgba(59, 130, 246, 0.8)", border: "rgb(59, 130, 246)" },
  glass: { bg: "rgba(20, 184, 166, 0.8)", border: "rgb(20, 184, 166)" },
  paper: { bg: "rgba(245, 158, 11, 0.8)", border: "rgb(245, 158, 11)" },
  metal: { bg: "rgba(100, 116, 139, 0.8)", border: "rgb(100, 116, 139)" },
  electronics: { bg: "rgba(249, 115, 22, 0.8)", border: "rgb(249, 115, 22)" },
}

export function MaterialChart({ data }: MaterialChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-muted-foreground">
        No recycling data yet. Start logging to see your breakdown!
      </div>
    )
  }

  const chartData = {
    labels: data.map((d) => d.material.charAt(0).toUpperCase() + d.material.slice(1)),
    datasets: [
      {
        data: data.map((d) => d.totalWeight),
        backgroundColor: data.map((d) => MATERIAL_COLORS[d.material]?.bg || "rgba(156, 163, 175, 0.8)"),
        borderColor: data.map((d) => MATERIAL_COLORS[d.material]?.border || "rgb(156, 163, 175)"),
        borderWidth: 2,
      },
    ],
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom" as const,
        labels: {
          padding: 20,
          usePointStyle: true,
        },
      },
      tooltip: {
        callbacks: {
          label: (context: { label: string; raw: number }) => {
            return `${context.label}: ${context.raw.toFixed(1)} kg`
          },
        },
      },
    },
  }

  return (
    <div className="h-64">
      <Doughnut data={chartData} options={options} />
    </div>
  )
}
