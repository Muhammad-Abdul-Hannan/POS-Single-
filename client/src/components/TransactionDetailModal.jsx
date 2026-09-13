import Modal from './Modal';
import { formatCurrency } from '../utils/format';

export default function TransactionDetailModal({ transaction, onClose }) {
  if (!transaction) return null;
  const isSale = transaction.type === 'sale';
  const due = transaction.totalAmount - transaction.amountPaid;

  return (
    <Modal open={!!transaction} onClose={onClose} title={isSale ? `Sale #${transaction.invoiceNo}` : 'Grinding Service'}>
      <div className="space-y-3 text-sm">
        <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400">
          <span>{new Date(transaction.date).toLocaleString()}</span>
          <span className="capitalize">{transaction.paymentType}</span>
        </div>

        {transaction.customerDisplayName && (
          <p className="text-slate-600 dark:text-slate-400">
            Customer: <span className="text-slate-900 dark:text-slate-100 font-medium">{transaction.customerDisplayName}</span>
          </p>
        )}

        {isSale ? (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-slate-500 dark:text-slate-400 uppercase border-b border-slate-200 dark:border-slate-800">
                <th className="py-1.5">Item</th>
                <th className="py-1.5 text-right">Qty</th>
                <th className="py-1.5 text-right">Rate</th>
                <th className="py-1.5 text-right">Amount</th>
              </tr>
            </thead>
            <tbody>
              {transaction.items.map((item, i) => (
                <tr key={i} className="border-b border-slate-100 dark:border-slate-800">
                  <td className="py-1.5 text-slate-900 dark:text-slate-100">{item.name}</td>
                  <td className="py-1.5 text-right text-slate-700 dark:text-slate-300">
                    {item.qty} {item.unit}
                  </td>
                  <td className="py-1.5 text-right text-slate-700 dark:text-slate-300">{formatCurrency(item.rate)}</td>
                  <td className="py-1.5 text-right text-slate-900 dark:text-slate-100">{formatCurrency(item.subtotal)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-3">
              <p className="text-xs text-slate-500 dark:text-slate-400">Quantity</p>
              <p className="font-medium text-slate-900 dark:text-slate-100">{transaction.quantityKg} kg</p>
            </div>
            <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-3">
              <p className="text-xs text-slate-500 dark:text-slate-400">Rate</p>
              <p className="font-medium text-slate-900 dark:text-slate-100">{formatCurrency(transaction.ratePerKg)} / kg</p>
            </div>
            {transaction.address && (
              <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-3 col-span-2">
                <p className="text-xs text-slate-500 dark:text-slate-400">Address</p>
                <p className="font-medium text-slate-900 dark:text-slate-100">{transaction.address}</p>
              </div>
            )}
          </div>
        )}

        <div className="text-right space-y-1 pt-2 border-t border-slate-200 dark:border-slate-800">
          <p className="font-semibold text-slate-900 dark:text-slate-100">Total: {formatCurrency(transaction.totalAmount)}</p>
          <p className="text-xs text-slate-600 dark:text-slate-400">Paid (cash): {formatCurrency(transaction.amountPaid)}</p>
          {due > 0 && <p className="text-xs text-red-600 dark:text-red-400">Credited: {formatCurrency(due)}</p>}
        </div>
      </div>
    </Modal>
  );
}
