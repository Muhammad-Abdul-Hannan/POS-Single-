export default function StockBadge({ stockQty, totalPurchasedQty, lowStockThreshold, unit }) {
  const low = lowStockThreshold > 0 && stockQty <= lowStockThreshold;
  // Total is only sent to owners. Never show a total smaller than what's in stock.
  const total = totalPurchasedQty != null ? Math.max(totalPurchasedQty, stockQty) : null;

  return (
    <span
      title={total != null ? `${stockQty} in stock out of ${total} received so far` : undefined}
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
        low
          ? 'bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-400'
          : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400'
      }`}
    >
      {total != null ? `${stockQty}/${total}` : stockQty} {unit}
      {low && ' · low'}
    </span>
  );
}