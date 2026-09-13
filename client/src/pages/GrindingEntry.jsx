import { useEffect, useState } from 'react';
import * as customersApi from '../api/customers';
import * as grindingApi from '../api/grinding';
import CustomerPicker from '../components/CustomerPicker';
import { formatCurrency } from '../utils/format';

const emptyForm = { customerName: '', phone: '', address: '', quantityKg: '', ratePerKg: '' };
const emptyNewCustomer = { name: '', phone: '', address: '' };

export default function GrindingEntry() {
  const [form, setForm] = useState(emptyForm);
  const [logs, setLogs] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [paymentType, setPaymentType] = useState('cash');
  const [customerMode, setCustomerMode] = useState('select');
  const [customerId, setCustomerId] = useState('');
  const [newCustomer, setNewCustomer] = useState(emptyNewCustomer);
  const [amountPaid, setAmountPaid] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  function load() {
    grindingApi.listGrindingLogs().then(setLogs).catch(() => {});
    customersApi.listCustomers().then(setCustomers).catch(() => {});
  }

  useEffect(load, []);

  const amount =
    Number(form.quantityKg) && Number(form.ratePerKg)
      ? Number(form.quantityKg) * Number(form.ratePerKg)
      : 0;

  function resetForm() {
    setForm(emptyForm);
    setPaymentType('cash');
    setCustomerMode('select');
    setCustomerId('');
    setNewCustomer(emptyNewCustomer);
    setAmountPaid('');
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    if (paymentType === 'credit' && customerMode === 'select' && !customerId) {
      return setError('Select or create a customer for a credit entry');
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

      await grindingApi.createGrindingLog({
        ...form,
        customerId: resolvedCustomerId || undefined,
        paymentType,
        amountPaid: paymentType === 'credit' ? Number(amountPaid) || 0 : undefined,
      });
      resetForm();
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save entry');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100 mb-1">Grinding Service</h1>
      <p className="text-slate-500 dark:text-slate-400 text-sm mb-6">Log a customer's wheat-grinding charge (no stock impact).</p>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-4 space-y-3">
          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Customer Name (optional)</label>
            <input
              className="w-full rounded-lg border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 px-3 py-2 text-sm"
              value={form.customerName}
              onChange={(e) => setForm({ ...form, customerName: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Phone (optional)</label>
            <input
              className="w-full rounded-lg border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 px-3 py-2 text-sm"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Address (optional)</label>
            <input
              className="w-full rounded-lg border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 px-3 py-2 text-sm"
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Quantity (kg)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                className="w-full rounded-lg border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 px-3 py-2 text-sm"
                value={form.quantityKg}
                onChange={(e) => setForm({ ...form, quantityKg: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Rate / kg</label>
              <input
                type="number"
                step="0.01"
                min="0"
                className="w-full rounded-lg border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 px-3 py-2 text-sm"
                value={form.ratePerKg}
                onChange={(e) => setForm({ ...form, ratePerKg: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="flex justify-between text-sm font-medium text-slate-900 dark:text-slate-100 pt-1">
            <span>Amount</span>
            <span>{formatCurrency(amount)}</span>
          </div>

          <div className="border-t border-slate-200 dark:border-slate-800 pt-3">
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Payment Type</label>
            <div className="flex gap-2 mb-3">
              {['cash', 'credit'].map((type) => (
                <button
                  key={type}
                  type="button"
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

            <CustomerPicker
              customers={customers}
              mode={customerMode}
              setMode={setCustomerMode}
              selectedId={customerId}
              setSelectedId={setCustomerId}
              newCustomer={newCustomer}
              setNewCustomer={setNewCustomer}
              allowWalkIn={paymentType === 'cash'}
              label={paymentType === 'credit' ? 'Udhaar Customer (required)' : 'Link to Customer (optional)'}
            />

            {paymentType === 'credit' && (
              <div className="mt-3">
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
          </div>

          {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white font-medium rounded-lg py-2 text-sm shadow-sm shadow-indigo-600/20"
          >
            {submitting ? 'Saving…' : 'Record Entry'}
          </button>
        </form>

        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-x-auto h-fit">
          <table className="min-w-full text-sm whitespace-nowrap">
            <thead>
              <tr className="text-left text-xs text-slate-500 dark:text-slate-400 uppercase border-b border-slate-200 dark:border-slate-800">
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Customer</th>
                <th className="px-4 py-3 text-right">Qty (kg)</th>
                <th className="px-4 py-3 text-right">Rate</th>
                <th className="px-4 py-3 text-right">Amount</th>
                <th className="px-4 py-3">Payment</th>
              </tr>
            </thead>
            <tbody>
              {logs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-6 text-center text-slate-400 dark:text-slate-500">
                    No entries yet.
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log._id} className="border-b border-slate-100 dark:border-slate-800 last:border-0 hover:bg-slate-50 dark:hover:bg-slate-800/50">
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{new Date(log.date).toLocaleDateString()}</td>
                    <td className="px-4 py-3 text-slate-900 dark:text-slate-100">{log.customer?.name || log.customerName || '—'}</td>
                    <td className="px-4 py-3 text-right text-slate-700 dark:text-slate-300">{log.quantityKg}</td>
                    <td className="px-4 py-3 text-right text-slate-700 dark:text-slate-300">{formatCurrency(log.ratePerKg)}</td>
                    <td className="px-4 py-3 text-right font-medium text-slate-900 dark:text-slate-100">{formatCurrency(log.amount)}</td>
                    <td className="px-4 py-3 capitalize text-xs">
                      <span className={log.paymentType === 'credit' ? 'text-red-600 dark:text-red-400' : 'text-emerald-600 dark:text-emerald-400'}>
                        {log.paymentType}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
