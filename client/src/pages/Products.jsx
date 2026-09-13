import { useEffect, useState } from 'react';
import * as productsApi from '../api/products';
import Modal from '../components/Modal';
import StockBadge from '../components/StockBadge';
import { useAuth } from '../context/AuthContext';
import { formatCurrency } from '../utils/format';

const emptyForm = {
  name: '',
  category: 'grocery',
  unit: 'kg',
  sellingPricePerUnit: '',
  costPricePerUnit: '',
  stockQty: '',
  lowStockThreshold: '',
};

export default function Products() {
  const { isOwner } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [adjustProduct, setAdjustProduct] = useState(null);
  const [adjustDirection, setAdjustDirection] = useState('add');
  const [adjustQty, setAdjustQty] = useState('');
  const [adjustReason, setAdjustReason] = useState('');
  const [adjustError, setAdjustError] = useState('');
  const [adjusting, setAdjusting] = useState(false);

  function load() {
    setLoading(true);
    productsApi
      .listProducts()
      .then(setProducts)
      .catch((err) => setError(err.response?.data?.message || 'Failed to load products'))
      .finally(() => setLoading(false));
  }

  useEffect(load, []);

  function openAdd() {
    setEditingId(null);
    setForm(emptyForm);
    setModalOpen(true);
  }

  function openEdit(product) {
    setEditingId(product._id);
    setForm({
      name: product.name,
      category: product.category,
      unit: product.unit,
      sellingPricePerUnit: product.sellingPricePerUnit,
      costPricePerUnit: product.costPricePerUnit ?? '',
      stockQty: product.stockQty,
      lowStockThreshold: product.lowStockThreshold,
    });
    setModalOpen(true);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setError('');
    const payload = {
      name: form.name,
      category: form.category,
      unit: form.unit,
      sellingPricePerUnit: Number(form.sellingPricePerUnit),
      costPricePerUnit: Number(form.costPricePerUnit),
      lowStockThreshold: Number(form.lowStockThreshold) || 0,
    };
    if (!editingId) payload.stockQty = Number(form.stockQty) || 0;

    try {
      if (editingId) {
        await productsApi.updateProduct(editingId, payload);
      } else {
        await productsApi.createProduct(payload);
      }
      setModalOpen(false);
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save product');
    } finally {
      setSaving(false);
    }
  }

  function openAdjust(product) {
    setAdjustProduct(product);
    setAdjustDirection('add');
    setAdjustQty('');
    setAdjustReason('');
    setAdjustError('');
  }

  async function handleAdjustSubmit(e) {
    e.preventDefault();
    setAdjustError('');
    const qty = Number(adjustQty);
    if (!qty || qty <= 0) return setAdjustError('Enter a valid quantity');

    const delta = adjustDirection === 'add' ? qty : -qty;
    setAdjusting(true);
    try {
      await productsApi.adjustStock(adjustProduct._id, delta, adjustReason || 'Manual adjustment');
      setAdjustProduct(null);
      load();
    } catch (err) {
      setAdjustError(err.response?.data?.message || 'Failed to adjust stock');
    } finally {
      setAdjusting(false);
    }
  }

  async function handleDelete(product) {
    if (!window.confirm(`Delete "${product.name}"? This cannot be undone.`)) return;
    try {
      await productsApi.deleteProduct(product._id);
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete product');
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">Products / Stock</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm">Grocery items and bulk aata inventory.</p>
        </div>
        {isOwner && (
          <button
            onClick={openAdd}
            className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg px-4 py-2 shadow-sm shadow-indigo-600/20"
          >
            + Add Product
          </button>
        )}
      </div>

      {error && <p className="text-sm text-red-600 dark:text-red-400 mb-4">{error}</p>}

      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-x-auto">
        <table className="min-w-full text-sm whitespace-nowrap">
          <thead>
            <tr className="text-left text-xs text-slate-500 dark:text-slate-400 uppercase border-b border-slate-200 dark:border-slate-800">
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3">Selling Price</th>
              {isOwner && <th className="px-4 py-3">Cost Price</th>}
              <th className="px-4 py-3">Stock</th>
              {isOwner && <th className="px-4 py-3 text-right">Actions</th>}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-slate-400 dark:text-slate-500">
                  Loading…
                </td>
              </tr>
            ) : products.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-slate-400 dark:text-slate-500">
                  No products yet.
                </td>
              </tr>
            ) : (
              products.map((p) => (
                <tr
                  key={p._id}
                  className="border-b border-slate-100 dark:border-slate-800 last:border-0 hover:bg-slate-50 dark:hover:bg-slate-800/50"
                >
                  <td className="px-4 py-3 font-medium text-slate-900 dark:text-slate-100">{p.name}</td>
                  <td className="px-4 py-3 capitalize text-slate-600 dark:text-slate-400">{p.category}</td>
                  <td className="px-4 py-3 text-slate-700 dark:text-slate-300">
                    {formatCurrency(p.sellingPricePerUnit)} / {p.unit}
                  </td>
                  {isOwner && (
                    <td className="px-4 py-3 text-slate-700 dark:text-slate-300">
                      {formatCurrency(p.costPricePerUnit)} / {p.unit}
                    </td>
                  )}
                  <td className="px-4 py-3">
                    <StockBadge stockQty={p.stockQty} lowStockThreshold={p.lowStockThreshold} unit={p.unit} />
                  </td>
                  {isOwner && (
                    <td className="px-4 py-3 text-right space-x-3 whitespace-nowrap">
                      <button onClick={() => openAdjust(p)} className="text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 text-xs">
                        Adjust
                      </button>
                      <button onClick={() => openEdit(p)} className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 text-xs">
                        Edit
                      </button>
                      <button onClick={() => handleDelete(p)} className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 text-xs">
                        Delete
                      </button>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editingId ? 'Edit Product' : 'Add Product'}>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Name</label>
            <input
              className="w-full rounded-lg border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 px-3 py-2 text-sm"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Category</label>
              <select
                className="w-full rounded-lg border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 px-3 py-2 text-sm"
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
              >
                <option value="grocery">Grocery</option>
                <option value="aata">Aata</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Unit</label>
              <select
                className="w-full rounded-lg border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 px-3 py-2 text-sm"
                value={form.unit}
                onChange={(e) => setForm({ ...form, unit: e.target.value })}
              >
                <option value="kg">kg</option>
                <option value="piece">piece</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Selling Price / unit</label>
              <input
                type="number"
                step="0.01"
                min="0"
                className="w-full rounded-lg border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 px-3 py-2 text-sm"
                value={form.sellingPricePerUnit}
                onChange={(e) => setForm({ ...form, sellingPricePerUnit: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Cost Price / unit</label>
              <input
                type="number"
                step="0.01"
                min="0"
                className="w-full rounded-lg border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 px-3 py-2 text-sm"
                value={form.costPricePerUnit}
                onChange={(e) => setForm({ ...form, costPricePerUnit: e.target.value })}
                required
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {!editingId && (
              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Opening Stock</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  className="w-full rounded-lg border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 px-3 py-2 text-sm"
                  value={form.stockQty}
                  onChange={(e) => setForm({ ...form, stockQty: e.target.value })}
                />
              </div>
            )}
            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Low Stock Alert Below</label>
              <input
                type="number"
                step="0.01"
                min="0"
                className="w-full rounded-lg border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 px-3 py-2 text-sm"
                value={form.lowStockThreshold}
                onChange={(e) => setForm({ ...form, lowStockThreshold: e.target.value })}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white font-medium rounded-lg py-2 text-sm mt-2"
          >
            {saving ? 'Saving…' : editingId ? 'Save Changes' : 'Add Product'}
          </button>
        </form>
      </Modal>

      <Modal open={!!adjustProduct} onClose={() => setAdjustProduct(null)} title="Adjust Stock">
        {adjustProduct && (
          <form onSubmit={handleAdjustSubmit} className="space-y-3">
            <p className="text-sm text-slate-600 dark:text-slate-400">
              {adjustProduct.name} — current stock:{' '}
              <span className="font-medium text-slate-900 dark:text-slate-100">
                {adjustProduct.stockQty} {adjustProduct.unit}
              </span>
            </p>

            <div className="flex gap-2">
              {['add', 'remove'].map((dir) => (
                <button
                  key={dir}
                  type="button"
                  onClick={() => setAdjustDirection(dir)}
                  className={`flex-1 rounded-lg py-2 text-sm font-medium capitalize border ${
                    adjustDirection === dir
                      ? dir === 'add'
                        ? 'bg-emerald-600 text-white border-emerald-600'
                        : 'bg-red-600 text-white border-red-600'
                      : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-300 dark:border-slate-700'
                  }`}
                >
                  {dir === 'add' ? '+ Add Stock' : '− Remove Stock'}
                </button>
              ))}
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Quantity ({adjustProduct.unit})</label>
              <input
                type="number"
                step="0.01"
                min="0"
                autoFocus
                className="w-full rounded-lg border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 px-3 py-2 text-sm"
                value={adjustQty}
                onChange={(e) => setAdjustQty(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Reason (optional)</label>
              <input
                className="w-full rounded-lg border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 px-3 py-2 text-sm"
                placeholder="e.g. stock count correction, damaged goods"
                value={adjustReason}
                onChange={(e) => setAdjustReason(e.target.value)}
              />
            </div>

            {adjustQty && (
              <p className="text-xs text-slate-500 dark:text-slate-400">
                New stock will be:{' '}
                <span className="font-medium text-slate-700 dark:text-slate-200">
                  {adjustDirection === 'add'
                    ? adjustProduct.stockQty + Number(adjustQty)
                    : adjustProduct.stockQty - Number(adjustQty)}{' '}
                  {adjustProduct.unit}
                </span>
              </p>
            )}

            {adjustError && <p className="text-sm text-red-600 dark:text-red-400">{adjustError}</p>}

            <button
              type="submit"
              disabled={adjusting}
              className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white font-medium rounded-lg py-2 text-sm"
            >
              {adjusting ? 'Saving…' : 'Confirm Adjustment'}
            </button>
          </form>
        )}
      </Modal>
    </div>
  );
}
