import { formatCurrency } from '../utils/format';

export default function InvoiceReceipt({ sale }) {
  if (!sale) return null;

  return (
    <div id="invoice-print-area" className="text-sm text-slate-900 dark:text-slate-100 print:text-black">
      <div className="text-center mb-4">
        <h2 className="text-lg font-bold">Shop Manager</h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 print:text-slate-600">Karyana Store &amp; Aata Chakki</p>
      </div>

      <div className="flex justify-between text-xs text-slate-600 dark:text-slate-400 print:text-slate-600 mb-3">
        <span>Invoice #{sale.invoiceNo}</span>
        <span>{new Date(sale.date).toLocaleString()}</span>
      </div>

      {sale.customer && (
        <p className="text-xs text-slate-600 dark:text-slate-400 print:text-slate-600 mb-3">Customer: {sale.customer.name}</p>
      )}

      <table className="w-full text-xs mb-3">
        <thead>
          <tr className="border-b border-slate-300 dark:border-slate-700 print:border-slate-300 text-left">
            <th className="py-1">Item</th>
            <th className="py-1 text-right">Qty</th>
            <th className="py-1 text-right">Rate</th>
            <th className="py-1 text-right">Amount</th>
          </tr>
        </thead>
        <tbody>
          {sale.items.map((item, i) => (
            <tr key={i} className="border-b border-slate-100 dark:border-slate-800 print:border-slate-100">
              <td className="py-1">{item.name}</td>
              <td className="py-1 text-right">
                {item.qty} {item.unit}
              </td>
              <td className="py-1 text-right">{formatCurrency(item.rate)}</td>
              <td className="py-1 text-right">{formatCurrency(item.subtotal)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="text-right space-y-1">
        <p className="font-semibold">Total: {formatCurrency(sale.totalAmount)}</p>
        <p className="text-xs text-slate-600 dark:text-slate-400 print:text-slate-600">
          Paid: {formatCurrency(sale.amountPaid)} ({sale.paymentType})
        </p>
        {sale.paymentType === 'credit' && sale.totalAmount - sale.amountPaid > 0 && (
          <p className="text-xs text-red-600 dark:text-red-400 print:text-red-600">Due: {formatCurrency(sale.totalAmount - sale.amountPaid)}</p>
        )}
      </div>

      <p className="text-center text-xs text-slate-400 dark:text-slate-500 print:text-slate-400 mt-4">Thank you for your business!</p>
    </div>
  );
}
