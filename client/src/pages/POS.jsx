import { useEffect, useMemo, useState } from 'react';
import * as customersApi from '../api/customers';
import * as productsApi from '../api/products';
import * as salesApi from '../api/sales';
import CustomerPicker from '../components/CustomerPicker';
import InvoiceReceipt from '../components/InvoiceReceipt';
import Modal from '../components/Modal';
import { formatCurrency } from '../utils/format';

const emptyNewCustomer = { name: '', phone: '', address: '' };

function effectiveRate(item) {
  return item.customPrice != null ? item.customPrice : item.defaultRate;
}

export default function POS() {
  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [cart, setCart] = useState([]);
  const [selectedProductId, setSelectedProductId] = useState('');
  const [qtyInput, setQtyInput] = useState('');
  const [priceInput, setPriceInput] = useState('');
  const [editingIndex, setEditingIndex] = useState(null);
  const [editQty, setEditQty] = useState('');
  const [editCustomPrice, setEditCustomPrice] = useState('');
  const [paymentType, setPaymentType] = useState('cash');
  const [customerMode, setCustomerMode] = useState('select');
  const [customerId, setCustomerId] = useState('');
  const [newCustomer, setNewCustomer] = useState(emptyNewCustomer);
  const [amountPaid, setAmountPaid] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [completedSale, setCompletedSale] = useState(null);

  function loadCustomers() {
    customersApi.listCustomers().then(setCustomers).catch(() => {});
  }

  useEffect(() => {
    productsApi.listProducts().then(setProducts).catch(() => {});
    loadCustomers();
  }, []);

  const total = useMemo(() => cart.reduce((sum, item) => sum + item.subtotal, 0), [cart]);

  function addToCart() {
    setError('');
    const product = products.find((p) => p._id === selectedProductId);
    const qty = Number(qtyInput);
    if (!product) return setError('Select a product');
    if (!qty || qty <= 0) return setError('Enter a valid quantity');
    if (qty > product.stockQty) return setError(`Only ${product.stockQty} ${product.unit} in stock`);

    let customPrice = null;
    if (priceInput !== '') {
      const custom = Number(priceInput);
      if (!custom || custom <= 0) return setError('Enter a valid custom price');
      customPrice = custom;
    }

    const defaultRate = product.sellingPricePerUnit;
    const rate = customPrice ?? defaultRate;

    setCart((prev) => [
      ...prev,
      {
        productId: product._id,
        name: product.name,
        unit: product.unit,
        defaultRate,
        customPrice,
        qty,
        subtotal: Number((qty * rate).toFixed(2)),
      },
    ]);
    setSelectedProductId('');
    setQtyInput('');
    setPriceInput('');
  }

  function removeFromCart(index) {
    setCart((prev) => prev.filter((_, i) => i !== index));
    if (editingIndex === index) setEditingIndex(null);
  }

  function startEdit(index) {
    setEditingIndex(index);
    setEditQty(String(cart[index].qty));
    setEditCustomPrice(cart[index].customPrice != null ? String(cart[index].customPrice) : '');
  }

  function saveEdit(index) {
    const qty = Number(editQty);
    if (!qty || qty <= 0) return setError('Enter a valid quantity');

    let customPrice = null;
    if (editCustomPrice.trim() !== '') {
      const custom = Number(editCustomPrice);
      if (!custom || custom <= 0) return setError('Enter a valid custom price');
      customPrice = custom;
    }

    setError('');
    setCart((prev) =>
      prev.map((item, i) => {
        if (i !== index) return item;
        const rate = customPrice ?? item.defaultRate;
        return { ...item, qty, customPrice, subtotal: Number((qty * rate).toFixed(2)) };
      })
    );
    setEditingIndex(null);
  }

  function resetCustomerFields() {
    setCustomerMode('select');
    setCustomerId('');
    setNewCustomer(emptyNewCustomer);
    setAmountPaid('');
  }

  async function completeSale() {
    setError('');
    if (cart.length === 0) return setError('Cart is empty');
    if (paymentType === 'credit' && customerMode === 'select' && !customerId) {
      return setError('Select or create a customer for credit sale');
    }
    if (paymentType === 'credit' && customerMode === 'new' && !newCustomer.name.trim()) {
      return setError('Enter a name for the new customer');
    }

    setSubmitting(true);
    try {
      let resolvedCustomerId = null;
      if (customerMode === 'new' && newCustomer.name.trim()) {
        const created = await customersApi.createCustomer(newCustomer);
        resolvedCustomerId = created._id;
      } else if (customerMode === 'select' && customerId) {
        resolvedCustomerId = customerId;
      }

      const payload = {
        items: cart.map((i) => ({ productId: i.productId, qty: i.qty, rate: effectiveRate(i) })),
        paymentType,
        customerId: resolvedCustomerId || undefined,
        amountPaid: paymentType === 'credit' ? Number(amountPaid) || 0 : undefined,
      };
      const sale = await salesApi.createSale(payload);
      setCompletedSale(sale);
      setCart([]);
      resetCustomerFields();
      setPaymentType('cash');
      productsApi.listProducts().then(setProducts).catch(() => {});
      loadCustomers();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to complete sale');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100 mb-1">Billing (POS)</h1>
      <p className="text-slate-500 dark:text-slate-400 text-sm mb-6">Add items and generate an invoice.</p>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-4">
          <div className="flex flex-wrap gap-2 mb-4">
            <select
              className="flex-1 min-w-48 rounded-lg border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 px-3 py-2 text-sm"
              value={selectedProductId}
              onChange={(e) => setSelectedProductId(e.target.value)}
            >
              <option value="">Select product…</option>
              {products.map((p) => (
                <option key={p._id} value={p._id} disabled={p.stockQty <= 0}>
                  {p.name} — {formatCurrency(p.sellingPricePerUnit)}/{p.unit} ({p.stockQty} {p.unit} left)
                </option>
              ))}
            </select>
            <input
              type="number"
              step="0.01"
              min="0"
              placeholder="Qty"
              className="w-20 rounded-lg border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 px-3 py-2 text-sm"
              value={qtyInput}
              onChange={(e) => setQtyInput(e.target.value)}
            />
            <input
              type="number"
              step="0.01"
              min="0"
              placeholder="Custom price"
              title="Leave blank to use the usual selling price"
              className="w-28 rounded-lg border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 px-3 py-2 text-sm"
              value={priceInput}
              onChange={(e) => setPriceInput(e.target.value)}
            />
            <button
              onClick={addToCart}
              className="bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white text-white text-sm font-medium rounded-lg px-4"
            >
              Add
            </button>
          </div>

          <div className="overflow-x-auto">
          <table className="min-w-full text-sm whitespace-nowrap">
            <thead>
              <tr className="text-left text-xs text-slate-500 dark:text-slate-400 uppercase border-b border-slate-200 dark:border-slate-800">
                <th className="py-2">Item</th>
                <th className="py-2 text-right">Qty</th>
                <th className="py-2 text-right">Rate</th>
                <th className="py-2 text-right">Custom Price</th>
                <th className="py-2 text-right">Subtotal</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {cart.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-6 text-center text-slate-400 dark:text-slate-500">
                    Cart is empty
                  </td>
                </tr>
              ) : (
                cart.map((item, index) =>
                  editingIndex === index ? (
                    <tr key={index} className="border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
                      <td className="py-2 text-slate-900 dark:text-slate-100">{item.name}</td>
                      <td className="py-2 text-right">
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          className="w-16 rounded border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 px-2 py-1 text-right text-sm"
                          value={editQty}
                          onChange={(e) => setEditQty(e.target.value)}
                        />
                      </td>
                      <td className="py-2 text-right text-slate-500 dark:text-slate-400">{formatCurrency(item.defaultRate)}</td>
                      <td className="py-2 text-right">
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          placeholder="—"
                          className="w-20 rounded border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 px-2 py-1 text-right text-sm"
                          value={editCustomPrice}
                          onChange={(e) => setEditCustomPrice(e.target.value)}
                        />
                      </td>
                      <td className="py-2 text-right text-slate-900 dark:text-slate-100">
                        {formatCurrency(
                          (Number(editQty) || 0) * (editCustomPrice.trim() !== '' ? Number(editCustomPrice) || 0 : item.defaultRate)
                        )}
                      </td>
                      <td className="py-2 text-right whitespace-nowrap">
                        <button onClick={() => saveEdit(index)} className="text-emerald-600 dark:text-emerald-400 hover:text-emerald-800 dark:hover:text-emerald-300 text-xs mr-2">
                          Save
                        </button>
                        <button onClick={() => setEditingIndex(null)} className="text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 text-xs">
                          Cancel
                        </button>
                      </td>
                    </tr>
                  ) : (
                    <tr key={index} className="border-b border-slate-100 dark:border-slate-800">
                      <td className="py-2 text-slate-900 dark:text-slate-100">{item.name}</td>
                      <td className="py-2 text-right text-slate-700 dark:text-slate-300">
                        {item.qty} {item.unit}
                      </td>
                      <td className="py-2 text-right text-slate-500 dark:text-slate-400">{formatCurrency(item.defaultRate)}</td>
                      <td className="py-2 text-right text-slate-700 dark:text-slate-300">
                        {item.customPrice != null ? formatCurrency(item.customPrice) : '—'}
                      </td>
                      <td className="py-2 text-right text-slate-900 dark:text-slate-100">{formatCurrency(item.subtotal)}</td>
                      <td className="py-2 text-right whitespace-nowrap">
                        <button onClick={() => startEdit(index)} className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 text-xs mr-2">
                          Edit
                        </button>
                        <button onClick={() => removeFromCart(index)} className="text-red-500 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 text-xs">
                          Remove
                        </button>
                      </td>
                    </tr>
                  )
                )
              )}
            </tbody>
          </table>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-4 h-fit space-y-4">
          <div className="flex justify-between text-base font-semibold text-slate-900 dark:text-slate-100">
            <span>Total</span>
            <span>{formatCurrency(total)}</span>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Payment Type</label>
            <div className="flex gap-2">
              {['cash', 'credit'].map((type) => (
                <button
                  key={type}
                  onClick={() => {
                    setPaymentType(type);
                    if (type === 'cash') setAmountPaid('');
                  }}
                  className={`flex-1 rounded-lg py-2 text-sm font-medium capitalize border ${
                    paymentType === type
                      ? 'bg-indigo-600 text-white border-indigo-600'
                      : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-300 dark:border-slate-700'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          <CustomerPicker
            customers={customers}
            mode={customerMode}
            setMode={setCustomerMode}
            selectedId={customerId}
            setSelectedId={setCustomerId}
            newCustomer={newCustomer}
            setNewCustomer={setNewCustomer}
            allowWalkIn={paymentType === 'cash'}
            label={paymentType === 'credit' ? 'Customer (required for credit)' : 'Customer (optional)'}
          />

          {paymentType === 'credit' && (
            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Amount Paid Now (optional)</label>
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
          )}

          {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}

          <button
            onClick={completeSale}
            disabled={submitting}
            className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white font-medium rounded-lg py-2.5 text-sm shadow-sm shadow-emerald-600/20"
          >
            {submitting ? 'Processing…' : 'Complete Sale'}
          </button>
        </div>
      </div>

      <Modal open={!!completedSale} onClose={() => setCompletedSale(null)} title="Invoice">
        <InvoiceReceipt sale={completedSale} />
        <div className="flex gap-2 mt-4">
          <button
            onClick={() => window.print()}
            className="flex-1 bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white text-white text-sm font-medium rounded-lg py-2"
          >
            Print
          </button>
          <button
            onClick={() => setCompletedSale(null)}
            className="flex-1 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-sm font-medium rounded-lg py-2"
          >
            Close
          </button>
        </div>
      </Modal>
    </div>
  );
}
