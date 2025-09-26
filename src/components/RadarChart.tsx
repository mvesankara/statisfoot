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

/**
 * @component RadarChart
 * @description Affiche un graphique de type "radar" (ou toile d'araignée) en utilisant Chart.js.
 * @param {object} props - Les props du composant.
 * @param {object} props.data - Les données du graphique.
 * @param {string[]} props.data.labels - Les libellés pour chaque axe du radar.
 * @param {number[]} props.data.values - Les valeurs pour chaque libellé.
 * @returns {JSX.Element} Le composant du graphique radar.
 */
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
