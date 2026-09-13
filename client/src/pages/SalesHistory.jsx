import { useEffect, useState } from 'react';
import * as grindingApi from '../api/grinding';
import * as salesApi from '../api/sales';
import TransactionDetailModal from '../components/TransactionDetailModal';
import { formatCurrency } from '../utils/format';

function firstOfMonth() {
  const d = new Date();
  d.setDate(1);
  return d.toISOString().slice(0, 10);
}
function today() {
  return new Date().toISOString().slice(0, 10);
}

function normalizeSale(s) {
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
  };
}

function normalizeGrinding(g) {
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
  };
}

export default function SalesHistory() {
  const [from, setFrom] = useState(firstOfMonth());
  const [to, setTo] = useState(today());
  const [type, setType] = useState('both');
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTxn, setSelectedTxn] = useState(null);

  function load() {
    setLoading(true);
    const params = { from, to };
    const requests = [];
    if (type === 'sales' || type === 'both') requests.push(salesApi.listSales(params).then((r) => r.map(normalizeSale)));
    if (type === 'grinding' || type === 'both')
      requests.push(grindingApi.listGrindingLogs(params).then((r) => r.map(normalizeGrinding)));

    Promise.all(requests)
      .then((results) => {
        const merged = results.flat().sort((a, b) => new Date(b.date) - new Date(a.date));
        setRows(merged);
      })
      .catch(() => setRows([]))
      .finally(() => setLoading(false));
  }

  useEffect(load, [from, to, type]);

  const totalAmount = rows.reduce((sum, r) => sum + r.totalAmount, 0);

  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">Sales History</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm">
            {rows.length} record{rows.length !== 1 ? 's' : ''} · Total {formatCurrency(totalAmount)}
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm flex-wrap">
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="rounded-lg border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 px-2 py-1.5"
          >
            <option value="both">Sales + Grinding</option>
            <option value="sales">Sales Only</option>
            <option value="grinding">Grinding Only</option>
          </select>
          <input
            type="date"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            className="rounded-lg border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 px-2 py-1.5"
          />
          <span className="text-slate-400 dark:text-slate-500">to</span>
          <input
            type="date"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            className="rounded-lg border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 px-2 py-1.5"
          />
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs text-slate-500 dark:text-slate-400 uppercase border-b border-slate-200 dark:border-slate-800">
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Type</th>
              <th className="px-4 py-3">Customer</th>
              <th className="px-4 py-3">Payment</th>
              <th className="px-4 py-3 text-right">Amount</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-slate-400 dark:text-slate-500">
                  Loading…
                </td>
              </tr>
            ) : rows.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-slate-400 dark:text-slate-500">
                  No records in this range.
                </td>
              </tr>
            ) : (
              rows.map((r) => (
                <tr
                  key={`${r.type}-${r.id}`}
                  onClick={() => setSelectedTxn(r)}
                  className="border-b border-slate-100 dark:border-slate-800 last:border-0 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50"
                >
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{new Date(r.date).toLocaleString()}</td>
                  <td className="px-4 py-3 capitalize text-slate-700 dark:text-slate-300">{r.type}</td>
                  <td className="px-4 py-3 text-slate-900 dark:text-slate-100">{r.customerDisplayName || 'Walk-in'}</td>
                  <td className="px-4 py-3 capitalize">
                    <span className={r.paymentType === 'credit' ? 'text-red-600 dark:text-red-400' : 'text-emerald-600 dark:text-emerald-400'}>
                      {r.paymentType}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right font-medium text-slate-900 dark:text-slate-100">{formatCurrency(r.totalAmount)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <TransactionDetailModal transaction={selectedTxn} onClose={() => setSelectedTxn(null)} />
    </div>
  );
}
