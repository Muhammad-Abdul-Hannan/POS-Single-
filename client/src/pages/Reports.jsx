import { useEffect, useState } from 'react';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import * as reportsApi from '../api/reports';
import { formatCurrency } from '../utils/format';

function firstOfMonth() {
  const d = new Date();
  d.setDate(1);
  return d.toISOString().slice(0, 10);
}
function today() {
  return new Date().toISOString().slice(0, 10);
}

export default function Reports() {
  const [from, setFrom] = useState(firstOfMonth());
  const [to, setTo] = useState(today());
  const [pnl, setPnl] = useState(null);
  const [dailySales, setDailySales] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [lowStock, setLowStock] = useState([]);

  function load() {
    const params = { from, to };
    reportsApi.getProfitLoss(params).then(setPnl).catch(() => {});
    reportsApi.getDailySales(params).then(setDailySales).catch(() => {});
    reportsApi.getTopProducts({ ...params, limit: 5 }).then(setTopProducts).catch(() => {});
    reportsApi.getLowStock().then(setLowStock).catch(() => {});
  }

  useEffect(load, [from, to]);

  const profitPositive = pnl && pnl.netProfit >= 0;

  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">Reports</h1>
        <div className="flex items-center gap-2 text-sm flex-wrap">
          <input
            type="date"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            className="rounded-lg border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 px-2 py-1.5 min-w-0"
          />
          <span className="text-slate-400 dark:text-slate-500">to</span>
          <input
            type="date"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            className="rounded-lg border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 px-2 py-1.5 min-w-0"
          />
        </div>
      </div>

      {pnl && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <StatTile label="Total Revenue" value={formatCurrency(pnl.totalRevenue)} />
          <StatTile label="Cost of Goods" value={formatCurrency(pnl.costOfGoods)} />
          <StatTile label="Expenses" value={formatCurrency(pnl.totalExpenses)} />
          <StatTile
            label="Net Profit"
            value={formatCurrency(pnl.netProfit)}
            valueClassName={profitPositive ? 'text-[#0ca30c]' : 'text-[#d03b3b]'}
          />
        </div>
      )}

      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-4 mb-6">
        <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-4">Daily Sales</h2>
        {dailySales.length === 0 ? (
          <p className="text-sm text-slate-400 dark:text-slate-500 py-10 text-center">No sales in this range.</p>
        ) : (
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={dailySales} margin={{ top: 4, right: 8, left: 0, bottom: 4 }}>
              <CartesianGrid vertical={false} stroke="var(--chart-grid)" />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: 'var(--chart-muted)' }} axisLine={{ stroke: 'var(--chart-axis)' }} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: 'var(--chart-muted)' }} axisLine={false} tickLine={false} width={40} />
              <Tooltip
                cursor={{ fill: 'rgba(42,120,214,0.08)' }}
                formatter={(value) => [formatCurrency(value), 'Sales']}
                contentStyle={{
                  fontSize: 12,
                  borderRadius: 8,
                  border: '1px solid var(--chart-grid)',
                  background: 'var(--chart-surface)',
                  color: 'var(--chart-text)',
                }}
                labelStyle={{ color: 'var(--chart-text)' }}
              />
              <Bar dataKey="total" fill="var(--chart-series-1)" radius={[4, 4, 0, 0]} maxBarSize={36} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-4">
          <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-3">Top Selling Products</h2>
          {topProducts.length === 0 ? (
            <p className="text-sm text-slate-400 dark:text-slate-500 py-6 text-center">No sales data yet.</p>
          ) : (
            <div className="overflow-x-auto">
            <table className="min-w-full text-sm whitespace-nowrap">
              <thead>
                <tr className="text-left text-xs text-slate-500 dark:text-slate-400 uppercase border-b border-slate-200 dark:border-slate-800">
                  <th className="py-2">Product</th>
                  <th className="py-2 text-right">Qty Sold</th>
                  <th className="py-2 text-right">Revenue</th>
                </tr>
              </thead>
              <tbody>
                {topProducts.map((p) => (
                  <tr key={p.name} className="border-b border-slate-100 dark:border-slate-800 last:border-0">
                    <td className="py-2 text-slate-900 dark:text-slate-100">{p.name}</td>
                    <td className="py-2 text-right text-slate-700 dark:text-slate-300">{p.qtySold}</td>
                    <td className="py-2 text-right text-slate-900 dark:text-slate-100">{formatCurrency(p.revenue)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
          )}
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-4">
          <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-3">Low Stock Items</h2>
          {lowStock.length === 0 ? (
            <p className="text-sm text-slate-400 dark:text-slate-500 py-6 text-center">Nothing is low on stock.</p>
          ) : (
            <div className="overflow-x-auto">
            <table className="min-w-full text-sm whitespace-nowrap">
              <thead>
                <tr className="text-left text-xs text-slate-500 dark:text-slate-400 uppercase border-b border-slate-200 dark:border-slate-800">
                  <th className="py-2">Product</th>
                  <th className="py-2 text-right">Stock</th>
                  <th className="py-2 text-right">Threshold</th>
                </tr>
              </thead>
              <tbody>
                {lowStock.map((p) => (
                  <tr key={p._id} className="border-b border-slate-100 dark:border-slate-800 last:border-0">
                    <td className="py-2 text-slate-900 dark:text-slate-100">{p.name}</td>
                    <td className="py-2 text-right text-[#d03b3b] font-medium">
                      {p.stockQty} {p.unit}
                    </td>
                    <td className="py-2 text-right text-slate-500 dark:text-slate-400">{p.lowStockThreshold}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StatTile({ label, value, valueClassName = 'text-slate-900 dark:text-slate-100' }) {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-4">
      <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">{label}</p>
      <p className={`text-xl font-semibold ${valueClassName}`}>{value}</p>
    </div>
  );
}
