"use client"

import { Bar } from "react-chartjs-2"
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js"

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

interface WeeklyDataPoint {
  _id: string
  totalWeight: number
  totalPoints: number
}

interface WeeklyChartProps {
  data: WeeklyDataPoint[]
}

export function WeeklyChart({ data }: WeeklyChartProps) {
  // Generate last 7 days
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date()
    date.setDate(date.getDate() - (6 - i))
    return date.toISOString().split("T")[0]
  })

  const dataMap = new Map(data.map((d) => [d._id, d]))

  const chartData = {
    labels: last7Days.map((date) => {
      const d = new Date(date)
      return d.toLocaleDateString("en-US", { weekday: "short" })
    }),
    datasets: [
      {
        label: "Weight (kg)",
        data: last7Days.map((date) => dataMap.get(date)?.totalWeight || 0),
        backgroundColor: "rgba(34, 197, 94, 0.8)",
        borderColor: "rgb(34, 197, 94)",
        borderWidth: 2,
        borderRadius: 6,
      },
    ],
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: (context: { raw: number }) => {
            return `${context.raw.toFixed(1)} kg recycled`
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: "rgba(0, 0, 0, 0.05)",
        },
      },
      x: {
        grid: {
          display: false,
        },
      },
    },
  }

  return (
    <div className="h-64">
      <Bar data={chartData} options={options} />
    </div>
  )
}
