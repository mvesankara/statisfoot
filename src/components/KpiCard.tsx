/**
 * @component KpiCard
 * @description Affiche une "carte" d'indicateur de performance clé (KPI) avec un libellé et une valeur.
 * @param {object} props - Les props du composant.
 * @param {string} props.label - Le libellé du KPI.
 * @param {string|number} props.value - La valeur du KPI.
 * @returns {JSX.Element} Le composant de la carte KPI.
 */
export default function KpiCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-lg bg-gray-50 p-4">
      <p className="text-xs text-gray-500">{label}</p>
      <p className="text-2xl font-semibold">{value}</p>
    </div>
  );
}
