// Spreads a purchase-level extra expense (bilti, freight, loading...) across the purchase lines
// in proportion to each line's value (qty x supplier cost), then works out the real cost per unit.
// If every line is free (value 0) the expense is spread by quantity instead.
export function allocateExtraExpense(lines, extraExpense) {
  const extra = Number(extraExpense) || 0;
  const totalValue = lines.reduce((sum, l) => sum + l.qty * l.costPrice, 0);
  const totalQty = lines.reduce((sum, l) => sum + l.qty, 0);

  return lines.map((l) => {
    let share = 0;
    if (extra > 0) {
      share = totalValue > 0 ? (extra * (l.qty * l.costPrice)) / totalValue : (extra * l.qty) / totalQty;
    }
    return {
      extraCost: Number(share.toFixed(2)),
      landedCostPrice: Number((l.costPrice + share / l.qty).toFixed(4)),
    };
  });
}