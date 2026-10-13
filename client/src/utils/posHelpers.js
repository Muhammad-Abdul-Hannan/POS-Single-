import { PRICE_SOURCE } from './posConstants';

export function roundMoney(value) {
  return Number(Number(value).toFixed(2));
}

// Turns a number into a clean string for an input box (max 4 decimals, no trailing zeros).
export function formatInputNumber(value) {
  const n = Number(value);
  if (!Number.isFinite(n)) return '';
  return String(Number(n.toFixed(4)));
}

export function effectiveRate(item) {
  return item.customPrice != null ? item.customPrice : item.defaultRate;
}

// Keeps "price per unit" and "total price" in sync.
// - Typing a unit price calculates the total (qty x price).
// - Typing a total calculates the unit price (total / qty).
// - Changing qty recalculates whichever field was NOT typed last.
export function syncLinePricing({ qty, price, total, source, changed }) {
  const q = Number(qty);
  const hasQty = q > 0;
  const nextSource =
    changed === 'price' ? PRICE_SOURCE.UNIT : changed === 'total' ? PRICE_SOURCE.TOTAL : source;

  if (nextSource === PRICE_SOURCE.TOTAL) {
    if (total === '') return { price: '', total: '', source: nextSource };
    return {
      price: hasQty ? formatInputNumber(Number(total) / q) : '',
      total,
      source: nextSource,
    };
  }

  if (price === '') return { price: '', total: '', source: nextSource };
  return {
    price,
    total: hasQty ? formatInputNumber(roundMoney(q * Number(price))) : '',
    source: nextSource,
  };
}

// Works out what a cart line should cost. Returns { error } or { customPrice, subtotal, lumpSum }.
// lumpSum = true means the cashier entered the whole amount, so that exact amount is the subtotal.
export function resolveLinePricing({ qty, defaultRate, price, total, source }) {
  if (source === PRICE_SOURCE.TOTAL && total !== '') {
    const t = Number(total);
    if (!t || t <= 0) return { error: 'Enter a valid total price' };
    const subtotal = roundMoney(t);
    return { customPrice: subtotal / qty, subtotal, lumpSum: true };
  }

  if (price !== '') {
    const p = Number(price);
    if (!p || p <= 0) return { error: 'Enter a valid custom price' };
    return { customPrice: p, subtotal: roundMoney(qty * p), lumpSum: false };
  }

  return { customPrice: null, subtotal: roundMoney(qty * defaultRate), lumpSum: false };
}

// Lump-sum lines send the exact total so no rounding drift can creep in; others send the rate as before.
export function buildSaleItemPayload(item) {
  if (item.lumpSum) {
    return { productId: item.productId, qty: item.qty, lineTotal: item.subtotal };
  }
  return { productId: item.productId, qty: item.qty, rate: effectiveRate(item) };
}