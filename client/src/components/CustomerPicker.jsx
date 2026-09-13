export default function CustomerPicker({
  customers,
  mode,
  setMode,
  selectedId,
  setSelectedId,
  newCustomer,
  setNewCustomer,
  allowWalkIn = false,
  label = 'Customer',
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1 flex-wrap gap-x-2 gap-y-1">
        <label className="block text-xs font-medium text-slate-600 dark:text-slate-400">{label}</label>
        <button
          type="button"
          onClick={() => setMode(mode === 'new' ? 'select' : 'new')}
          className="text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 font-medium"
        >
          {mode === 'new' ? '← Choose existing' : '+ New Customer'}
        </button>
      </div>

      {mode === 'new' ? (
        <div className="space-y-2 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700">
          <input
            className="w-full rounded-lg border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 px-3 py-2 text-sm"
            placeholder="Name (required)"
            value={newCustomer.name}
            onChange={(e) => setNewCustomer({ ...newCustomer, name: e.target.value })}
          />
          <input
            className="w-full rounded-lg border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 px-3 py-2 text-sm"
            placeholder="Phone (optional)"
            value={newCustomer.phone}
            onChange={(e) => setNewCustomer({ ...newCustomer, phone: e.target.value })}
          />
          <input
            className="w-full rounded-lg border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 px-3 py-2 text-sm"
            placeholder="Address (optional)"
            value={newCustomer.address}
            onChange={(e) => setNewCustomer({ ...newCustomer, address: e.target.value })}
          />
        </div>
      ) : (
        <select
          className="w-full rounded-lg border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 px-3 py-2 text-sm"
          value={selectedId}
          onChange={(e) => setSelectedId(e.target.value)}
        >
          {allowWalkIn && <option value="">Walk-in (no record)</option>}
          {!allowWalkIn && <option value="">Select customer…</option>}
          {customers.map((c) => (
            <option key={c._id} value={c._id}>
              {c.name} {c.phone ? `(${c.phone})` : ''}
              {c.creditBalance > 0 ? ` — owes Rs. ${c.creditBalance.toFixed(2)}` : ''}
            </option>
          ))}
        </select>
      )}
    </div>
  );
}
