function pad(n) {
  return String(n).padStart(2, '0');
}

function toInputDate(d) {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

// Dates are built from the local calendar day (toISOString would give the UTC day,
// which can be yesterday in the early morning).
export function firstOfMonth() {
  const d = new Date();
  d.setDate(1);
  return toInputDate(d);
}

export function today() {
  return toInputDate(new Date());
}

export function normalizeSale(s) {
  return {
    type: 'sale',
    id: s._id,
    date: s.date,
    invoiceNo: s.invoiceNo,
    items: s.items,
    totalAmount: s.totalAmount,
    amountPaid: s.amountPaid,
    paymentType: s.paymentType,
    customerDisplayName: s.customer?.name,
    profit: s.profit ?? 0,
  };
}

// Grinding has no product cost, so the whole amount counts as profit (same as the Reports page).
export function normalizeGrinding(g) {
  return {
    type: 'grinding',
    id: g._id,
    date: g.date,
    quantityKg: g.quantityKg,
    ratePerKg: g.ratePerKg,
    address: g.address,
    totalAmount: g.amount,
    amountPaid: g.amountPaid,
    paymentType: g.paymentType,
    customerDisplayName: g.customer?.name || g.customerName,
    profit: g.amount,
  };
}

export function sumBy(rows, key) {
  return Number(rows.reduce((sum, r) => sum + (Number(r[key]) || 0), 0).toFixed(2));
}