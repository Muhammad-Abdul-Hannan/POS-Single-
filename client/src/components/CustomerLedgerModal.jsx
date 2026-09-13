import { useEffect, useState } from 'react';
import * as customersApi from '../api/customers';
import { formatCurrency } from '../utils/format';
import Modal from './Modal';
import TransactionDetailModal from './TransactionDetailModal';

export default function CustomerLedgerModal({ customerId, onClose, onChanged }) {
  const [data, setData] = useState(null);
  const [payments, setPayments] = useState([]);
  const [showPayments, setShowPayments] = useState(false);
  const [selectedTxn, setSelectedTxn] = useState(null);
  const [payAmount, setPayAmount] = useState('');
  const [payError, setPayError] = useState('');

  function load() {
    if (!customerId) return;
    customersApi.getLedger(customerId).then(setData).catch(() => {});
    customersApi.listPayments(customerId).then(setPayments).catch(() => {});
  }

  useEffect(load, [customerId]);

  async function handleRecordPayment(e) {
    e.preventDefault();
    setPayError('');
    const amount = Number(payAmount);
    if (!amount || amount <= 0) return;
    try {
      await customersApi.recordPayment(customerId, amount);
      setPayAmount('');
      load();
      onChanged?.();
    } catch (err) {
      setPayError(err.response?.data?.message || 'Failed to record payment');
    }
  }

  if (!customerId) return null;
  const customer = data?.customer;

  return (
    <>
      <Modal open={!!customerId} onClose={onClose} title={customer ? `Ledger — ${customer.name}` : 'Ledger'}>
        {!data ? (
          <p className="text-sm text-slate-400 dark:text-slate-500 py-6 text-center">Loading…</p>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <button
                onClick={() => setShowPayments(false)}
                className={`text-xs font-medium px-3 py-1.5 rounded-lg ${!showPayments ? 'bg-indigo-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'}`}
              >
                Transactions
              </button>
              <button
                onClick={() => setShowPayments(true)}
                className={`text-xs font-medium px-3 py-1.5 rounded-lg ${showPayments ? 'bg-indigo-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'}`}
              >
                Payment History
              </button>
            </div>

            {!showPayments ? (
              <div className="max-h-72 overflow-y-auto">
                {data.transactions.length === 0 ? (
                  <p className="text-sm text-slate-400 dark:text-slate-500 py-6 text-center">No transactions yet.</p>
                ) : (
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left text-xs text-slate-500 dark:text-slate-400 uppercase border-b border-slate-200 dark:border-slate-800">
                        <th className="py-1.5">Date</th>
                        <th className="py-1.5">Type</th>
                        <th className="py-1.5 text-right">Amount</th>
                        <th className="py-1.5 text-right">Due</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.transactions.map((t) => (
                        <tr
                          key={t.id}
                          onClick={() => setSelectedTxn(t)}
                          className="border-b border-slate-100 dark:border-slate-800 last:border-0 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50"
                        >
                          <td className="py-1.5 text-slate-700 dark:text-slate-300">{new Date(t.date).toLocaleDateString()}</td>
                          <td className="py-1.5 capitalize text-slate-700 dark:text-slate-300">{t.type}</td>
                          <td className="py-1.5 text-right text-slate-900 dark:text-slate-100">{formatCurrency(t.totalAmount)}</td>
                          <td className="py-1.5 text-right text-red-600 dark:text-red-400">
                            {formatCurrency(t.totalAmount - t.amountPaid)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            ) : (
              <div className="max-h-72 overflow-y-auto">
                {payments.length === 0 ? (
                  <p className="text-sm text-slate-400 dark:text-slate-500 py-6 text-center">No payments recorded yet.</p>
                ) : (
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left text-xs text-slate-500 dark:text-slate-400 uppercase border-b border-slate-200 dark:border-slate-800">
                        <th className="py-1.5">Date</th>
                        <th className="py-1.5 text-right">Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {payments.map((p) => (
                        <tr key={p._id} className="border-b border-slate-100 dark:border-slate-800 last:border-0">
                          <td className="py-1.5 text-slate-700 dark:text-slate-300">{new Date(p.date).toLocaleString()}</td>
                          <td className="py-1.5 text-right text-emerald-600 dark:text-emerald-400 font-medium">{formatCurrency(p.amount)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            )}

            <div className="border-t border-slate-200 dark:border-slate-800 pt-3 space-y-2">
              <div className="flex justify-between text-sm font-semibold text-slate-900 dark:text-slate-100">
                <span>Total Outstanding</span>
                <span className={customer.creditBalance > 0 ? 'text-red-600 dark:text-red-400' : ''}>
                  {formatCurrency(customer.creditBalance)}
                </span>
              </div>
              {customer.creditBalance > 0 && (
                <form onSubmit={handleRecordPayment} className="flex gap-2">
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max={customer.creditBalance}
                    placeholder="Amount received"
                    className="flex-1 rounded-lg border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 px-3 py-2 text-sm"
                    value={payAmount}
                    onChange={(e) => setPayAmount(e.target.value)}
                  />
                  <button
                    type="submit"
                    className="bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-lg px-4"
                  >
                    Record Payment
                  </button>
                </form>
              )}
              {payError && <p className="text-xs text-red-600 dark:text-red-400">{payError}</p>}
            </div>
          </div>
        )}
      </Modal>

      <TransactionDetailModal transaction={selectedTxn} onClose={() => setSelectedTxn(null)} />
    </>
  );
}
