"use client";

import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const data = {
  labels: ["Juin", "Juil", "Août", "Sept", "Oct", "Nov"],
  datasets: [
    {
      label: "Rapports soumis",
      data: [5, 7, 8, 6, 9, 7],
      backgroundColor: "rgba(91, 196, 255, 0.5)",
      borderColor: "rgba(91, 196, 255, 1)",
      borderWidth: 1,
    },
  ],
};

const options = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: "top" as const,
      labels: {
        color: "#cbd5e1", // slate-300
      },
    },
    title: {
      display: true,
      text: "Volume par mois",
      color: "#f1f5f9", // slate-100
    },
  },
  scales: {
    y: {
      beginAtZero: true,
      ticks: {
        color: "#94a3b8", // slate-400
        stepSize: 1,
      },
      grid: {
        color: "rgba(255, 255, 255, 0.1)",
      },
    },
    x: {
      ticks: {
        color: "#94a3b8", // slate-400
      },
      grid: {
        display: false,
      },
    },
  },
};

/**
 * @component KpiCharts
 * @description Affiche un graphique en barres des indicateurs de performance clés (KPIs) pour le tableau de bord.
 * Utilise Chart.js pour le rendu du graphique.
 * @returns {JSX.Element} Le composant du graphique KPI.
 */
export function KpiCharts() {
  return (
    <div className="bg-slate-900/50 rounded-2xl ring-1 ring-white/10 shadow-md p-6 h-full">
      <h3 className="text-white font-semibold mb-4">Mes KPIs</h3>
      <div className="h-56">
        <Bar data={data} options={options} />
      </div>
    </div>
  );
}
