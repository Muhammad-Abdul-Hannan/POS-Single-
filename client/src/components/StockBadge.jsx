export default function StockBadge({ stockQty, lowStockThreshold, unit }) {
  const low = lowStockThreshold > 0 && stockQty <= lowStockThreshold;

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
        low
          ? 'bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-400'
          : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400'
      }`}
    >
      {stockQty} {unit}
      {low && ' · low'}
    </span>
  );
}
