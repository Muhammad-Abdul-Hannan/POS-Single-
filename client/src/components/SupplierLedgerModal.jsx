import { useEffect, useState } from "react";
import * as suppliersApi from "../api/suppliers";
import { formatCurrency } from "../utils/format";
import Modal from "./Modal";

export default function SupplierLedgerModal({
  supplierId,
  onClose,
  onChanged,
}) {
  const [data, setData] = useState(null);
  const [payments, setPayments] = useState([]);
  const [showPayments, setShowPayments] = useState(false);
  const [expandedId, setExpandedId] = useState(null);
  const [payAmount, setPayAmount] = useState("");
  const [payError, setPayError] = useState("");

  function load() {
    if (!supplierId) return;
    suppliersApi
      .getLedger(supplierId)
      .then(setData)
      .catch(() => {});
    suppliersApi
      .listPayments(supplierId)
      .then(setPayments)
      .catch(() => {});
  }

  useEffect(load, [supplierId]);

  async function handleRecordPayment(e) {
    e.preventDefault();
    setPayError("");
    const amount = Number(payAmount);
    if (!amount || amount <= 0) return;
    try {
      await suppliersApi.recordPayment(supplierId, amount);
      setPayAmount("");
      load();
      onChanged?.();
    } catch (err) {
      setPayError(err.response?.data?.message || "Failed to record payment");
    }
  }

  if (!supplierId) return null;
  const supplier = data?.supplier;

  return (
    <Modal
      open={!!supplierId}
      onClose={onClose}
      title={supplier ? `Ledger — ${supplier.name}` : "Ledger"}
    >
      {!data ? (
        <p className="text-sm text-slate-400 dark:text-slate-500 py-6 text-center">
          Loading…
        </p>
      ) : (
        <div className="space-y-4">
          {supplier.address && (
            <p className="text-xs text-slate-500 dark:text-slate-400">
              <span className="font-medium text-slate-600 dark:text-slate-300">
                Address:
              </span>{" "}
              {supplier.address}
              {supplier.phone && (
                <span className="ml-3 font-medium text-slate-600 dark:text-slate-300">
                  Phone:
                </span>
              )}{" "}
              {supplier.phone}
            </p>
          )}

          <div className="flex items-center justify-between">
            <button
              onClick={() => setShowPayments(false)}
              className={`text-xs font-medium px-3 py-1.5 rounded-lg ${!showPayments ? "bg-indigo-600 text-white" : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"}`}
            >
              Purchases
            </button>
            <button
              onClick={() => setShowPayments(true)}
              className={`text-xs font-medium px-3 py-1.5 rounded-lg ${showPayments ? "bg-indigo-600 text-white" : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"}`}
            >
              Payment History
            </button>
          </div>

          {!showPayments ? (
            <div className="max-h-72 overflow-y-auto">
              {data.purchases.length === 0 ? (
                <p className="text-sm text-slate-400 dark:text-slate-500 py-6 text-center">
                  No purchases yet.
                </p>
              ) : (
                <div className="space-y-2">
                  {data.purchases.map((p) => {
                    const due = p.totalCost - p.amountPaid;
                    const expanded = expandedId === p._id;
                    return (
                      <div
                        key={p._id}
                        className="border border-slate-100 dark:border-slate-800 rounded-lg"
                      >
                        <button
                          type="button"
                          onClick={() => setExpandedId(expanded ? null : p._id)}
                          className="w-full flex items-center justify-between gap-3 text-left px-3 py-2 text-sm hover:bg-slate-50 dark:hover:bg-slate-800/50"
                        >
                          <span className="text-slate-700 dark:text-slate-300 whitespace-nowrap">
                            {new Date(p.date).toLocaleDateString()}
                          </span>
                          <span className="text-slate-500 dark:text-slate-400 truncate flex-1 px-2">
                            {p.items.length} item
                            {p.items.length === 1 ? "" : "s"}
                          </span>
                          <span className="text-slate-900 dark:text-slate-100 font-medium whitespace-nowrap">
                            {formatCurrency(p.totalCost)}
                          </span>
                          {due > 0 && (
                            <span className="text-red-600 dark:text-red-400 text-xs whitespace-nowrap">
                              Due {formatCurrency(due)}
                            </span>
                          )}
                        </button>
                        {expanded && (
                          <div className="px-3 pb-2 pt-1 border-t border-slate-100 dark:border-slate-800">
                            <table className="min-w-full text-xs">
                              <tbody>
                                {p.items.map((item, i) => (
                                  <tr key={i}>
                                    <td className="py-0.5 text-slate-700 dark:text-slate-300">
                                      {item.name}
                                    </td>
                                    <td className="py-0.5 text-right text-slate-500 dark:text-slate-400 whitespace-nowrap">
                                      {item.qty} ×{" "}
                                      {formatCurrency(item.costPrice)}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ) : (
            <div className="max-h-72 overflow-y-auto">
              {payments.length === 0 ? (
                <p className="text-sm text-slate-400 dark:text-slate-500 py-6 text-center">
                  No payments recorded yet.
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm whitespace-nowrap">
                    <thead>
                      <tr className="text-left text-xs text-slate-500 dark:text-slate-400 uppercase border-b border-slate-200 dark:border-slate-800">
                        <th className="py-1.5">Date</th>
                        <th className="py-1.5 text-right">Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {payments.map((p) => (
                        <tr
                          key={p._id}
                          className="border-b border-slate-100 dark:border-slate-800 last:border-0"
                        >
                          <td className="py-1.5 text-slate-700 dark:text-slate-300 whitespace-nowrap">
                            {new Date(p.date).toLocaleString()}
                          </td>
                          <td className="py-1.5 text-right text-emerald-600 dark:text-emerald-400 font-medium whitespace-nowrap">
                            {formatCurrency(p.amount)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          <div className="border-t border-slate-200 dark:border-slate-800 pt-3 space-y-2">
            <div className="flex justify-between text-sm font-semibold text-slate-900 dark:text-slate-100">
              <span>Balance Owed</span>
              <span
                className={
                  supplier.balanceOwed > 0
                    ? "text-red-600 dark:text-red-400"
                    : ""
                }
              >
                {formatCurrency(supplier.balanceOwed)}
              </span>
            </div>
            {supplier.balanceOwed > 0 && (
              <form
                onSubmit={handleRecordPayment}
                className="flex gap-2 flex-wrap"
              >
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max={supplier.balanceOwed}
                  placeholder="Amount paid"
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
            {payError && (
              <p className="text-xs text-red-600 dark:text-red-400">
                {payError}
              </p>
            )}
          </div>
        </div>
      )}
    </Modal>
  );
}
