import { useEffect, useMemo, useState } from 'react';
import * as productsApi from '../api/products';
import * as purchasesApi from '../api/purchases';
import * as suppliersApi from '../api/suppliers';
import { formatCurrency } from '../utils/format';

export default function Purchases() {
  const [products, setProducts] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [purchases, setPurchases] = useState([]);
  const [supplierId, setSupplierId] = useState('');
  const [cart, setCart] = useState([]);
  const [selectedProductId, setSelectedProductId] = useState('');
  const [qtyInput, setQtyInput] = useState('');
  const [costInput, setCostInput] = useState('');
  const [amountPaid, setAmountPaid] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  function load() {
    productsApi.listProducts().then(setProducts).catch(() => {});
    suppliersApi.listSuppliers().then(setSuppliers).catch(() => {});
    purchasesApi.listPurchases().then(setPurchases).catch(() => {});
  }

  useEffect(load, []);

  const total = useMemo(() => cart.reduce((sum, i) => sum + i.qty * i.costPrice, 0), [cart]);

  function addToCart() {
    setError('');
    const product = products.find((p) => p._id === selectedProductId);
    const qty = Number(qtyInput);
    const costPrice = Number(costInput);
    if (!product) return setError('Select a product');
    if (!qty || qty <= 0) return setError('Enter a valid quantity');
    if (costPrice == null || costPrice < 0 || costInput === '') return setError('Enter a valid cost price');

    setCart((prev) => [
      ...prev,
      { productId: product._id, name: product.name, unit: product.unit, qty, costPrice },
    ]);
    setSelectedProductId('');
    setQtyInput('');
    setCostInput('');
  }

  function removeFromCart(index) {
    setCart((prev) => prev.filter((_, i) => i !== index));
  }

  async function submitPurchase() {
    setError('');
    if (!supplierId) return setError('Select a supplier');
    if (cart.length === 0) return setError('Add at least one item');

    setSubmitting(true);
    try {
      await purchasesApi.createPurchase({
        supplierId,
        items: cart.map((i) => ({ productId: i.productId, qty: i.qty, costPrice: i.costPrice })),
        amountPaid: Number(amountPaid) || 0,
      });
      setCart([]);
      setSupplierId('');
      setAmountPaid('');
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to record purchase');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100 mb-1">Purchases</h1>
      <p className="text-slate-500 dark:text-slate-400 text-sm mb-6">Record stock received from suppliers.</p>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-4">
          <div className="mb-4">
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Supplier</label>
            <select
              className="w-full rounded-lg border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 px-3 py-2 text-sm"
              value={supplierId}
              onChange={(e) => setSupplierId(e.target.value)}
            >
              <option value="">Select supplier…</option>
              {suppliers.map((s) => (
                <option key={s._id} value={s._id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-wrap gap-2 mb-4">
            <select
              className="flex-1 min-w-40 rounded-lg border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 px-3 py-2 text-sm"
              value={selectedProductId}
              onChange={(e) => setSelectedProductId(e.target.value)}
            >
              <option value="">Select product…</option>
              {products.map((p) => (
                <option key={p._id} value={p._id}>
                  {p.name} ({p.unit})
                </option>
              ))}
            </select>
            <input
              type="number"
              step="0.01"
              min="0"
              placeholder="Qty"
              className="w-24 rounded-lg border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 px-3 py-2 text-sm"
              value={qtyInput}
              onChange={(e) => setQtyInput(e.target.value)}
            />
            <input
              type="number"
              step="0.01"
              min="0"
              placeholder="Cost/unit"
              className="w-28 rounded-lg border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 px-3 py-2 text-sm"
              value={costInput}
              onChange={(e) => setCostInput(e.target.value)}
            />
            <button
              onClick={addToCart}
              className="bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white text-white text-sm font-medium rounded-lg px-4"
            >
              Add
            </button>
          </div>

          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-slate-500 dark:text-slate-400 uppercase border-b border-slate-200 dark:border-slate-800">
                <th className="py-2">Item</th>
                <th className="py-2 text-right">Qty</th>
                <th className="py-2 text-right">Cost/unit</th>
                <th className="py-2 text-right">Subtotal</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {cart.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-6 text-center text-slate-400 dark:text-slate-500">
                    No items added
                  </td>
                </tr>
              ) : (
                cart.map((item, i) => (
                  <tr key={i} className="border-b border-slate-100 dark:border-slate-800">
                    <td className="py-2 text-slate-900 dark:text-slate-100">{item.name}</td>
                    <td className="py-2 text-right text-slate-700 dark:text-slate-300">
                      {item.qty} {item.unit}
                    </td>
                    <td className="py-2 text-right text-slate-700 dark:text-slate-300">{formatCurrency(item.costPrice)}</td>
                    <td className="py-2 text-right text-slate-900 dark:text-slate-100">{formatCurrency(item.qty * item.costPrice)}</td>
                    <td className="py-2 text-right">
                      <button onClick={() => removeFromCart(i)} className="text-red-500 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 text-xs">
                        Remove
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-4 h-fit space-y-4">
          <div className="flex justify-between text-base font-semibold text-slate-900 dark:text-slate-100">
            <span>Total Cost</span>
            <span>{formatCurrency(total)}</span>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Amount Paid Now</label>
            <input
              type="number"
              step="0.01"
              min="0"
              className="w-full rounded-lg border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 px-3 py-2 text-sm"
              value={amountPaid}
              onChange={(e) => setAmountPaid(e.target.value)}
              placeholder="0"
            />
          </div>
          {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
          <button
            onClick={submitPurchase}
            disabled={submitting}
            className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white font-medium rounded-lg py-2.5 text-sm shadow-sm shadow-emerald-600/20"
          >
            {submitting ? 'Saving…' : 'Record Purchase'}
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs text-slate-500 dark:text-slate-400 uppercase border-b border-slate-200 dark:border-slate-800">
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Supplier</th>
              <th className="px-4 py-3 text-right">Total</th>
              <th className="px-4 py-3 text-right">Paid</th>
            </tr>
          </thead>
          <tbody>
            {purchases.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-6 text-center text-slate-400 dark:text-slate-500">
                  No purchases yet.
                </td>
              </tr>
            ) : (
              purchases.map((p) => (
                <tr key={p._id} className="border-b border-slate-100 dark:border-slate-800 last:border-0 hover:bg-slate-50 dark:hover:bg-slate-800/50">
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{new Date(p.date).toLocaleDateString()}</td>
                  <td className="px-4 py-3 text-slate-900 dark:text-slate-100">{p.supplier?.name}</td>
                  <td className="px-4 py-3 text-right text-slate-900 dark:text-slate-100">{formatCurrency(p.totalCost)}</td>
                  <td className="px-4 py-3 text-right text-slate-900 dark:text-slate-100">{formatCurrency(p.amountPaid)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
