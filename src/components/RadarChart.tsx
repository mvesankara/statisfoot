"use client";
import { Radar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
} from "chart.js";

ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip);

export default function RadarChart({ data }: { data: { labels: string[]; values: number[] } }) {
  const chartData = {
    labels: data.labels,
    datasets: [
      {
        label: "KPIs",
        data: data.values,
        backgroundColor: "rgba(59,130,246,0.2)",
        borderColor: "rgba(59,130,246,1)",
        borderWidth: 1,
        pointBackgroundColor: "rgba(59,130,246,1)",
      },
    ],
  };

  const options = {
    scales: {
      r: {
        beginAtZero: true,
        ticks: { display: false },
        grid: { color: "#e5e7eb" },
      },
    },
  };

  return <Radar data={chartData} options={options} className="max-w-md mx-auto" />;
}
