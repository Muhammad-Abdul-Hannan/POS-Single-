// Same maths as the server (server/utils/landedCost.js), used only for the on-screen preview.
// Spreads the extra expense over lines in proportion to their value (qty x cost), and returns
// the real cost per unit (supplier cost + the line's share of the expense).
export function previewLandedCosts(lines, extraExpense) {
  const extra = Number(extraExpense) || 0;
  const totalValue = lines.reduce((sum, l) => sum + l.qty * l.costPrice, 0);
  const totalQty = lines.reduce((sum, l) => sum + l.qty, 0);

  return lines.map((l) => {
    let share = 0;
    if (extra > 0) {
      share = totalValue > 0 ? (extra * (l.qty * l.costPrice)) / totalValue : (extra * l.qty) / totalQty;
    }
    return { extraCost: share, landedCostPrice: l.costPrice + share / l.qty };
  });
}