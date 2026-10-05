import {
  AlertTriangle,
  ArrowRight,
  Package,
  Receipt,
  ShoppingCart,
  TrendingUp,
  Truck,
  Users2,
  Wallet,
  Wheat,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import * as reportsApi from '../api/reports';
import { useAuth } from '../context/AuthContext';
import { formatCurrency } from '../utils/format';

function isoDate(d) {
  return d.toISOString().slice(0, 10);
}
function daysAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d;
}

const quickActions = [
  { to: '/pos', label: 'New Sale', icon: ShoppingCart },
  { to: '/grinding', label: 'Grinding Entry', icon: Wheat },
  { to: '/purchases', label: 'Record Purchase', icon: Truck },
  { to: '/expenses', label: 'Add Expense', icon: Wallet },
];

export default function Dashboard() {
  const { user } = useAuth();
  const [summary, setSummary] = useState(null);
  const [trend, setTrend] = useState([]);
  const [lowStock, setLowStock] = useState([]);

  useEffect(() => {
    reportsApi.getDashboardSummary().then(setSummary).catch(() => {});
    reportsApi
      .getDailySales({ from: isoDate(daysAgo(6)), to: isoDate(new Date()) })
      .then(setTrend)
      .catch(() => {});
    reportsApi.getLowStock().then(setLowStock).catch(() => {});
  }, []);

  const cards = [
    {
      label: "Today's Sales",
      value: summary ? formatCurrency(summary.todaySales) : '—',
      icon: Wallet,
      accent: 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10',
    },
    {
      label: 'Outstanding Udhaar',
      value: summary ? formatCurrency(summary.outstandingUdhaar) : '—',
      valueClassName: summary?.outstandingUdhaar > 0 ? 'text-[#d03b3b]' : undefined,
      icon: Users2,
      accent: 'text-[#d03b3b] bg-red-50 dark:bg-red-500/10',
    },
    {
      label: 'Low Stock Items',
      value: summary ? summary.lowStockCount : '—',
      valueClassName: summary?.lowStockCount > 0 ? 'text-[#fab219]' : undefined,
      icon: AlertTriangle,
      accent: 'text-[#fab219] bg-amber-50 dark:bg-amber-500/10',
    },
    {
      label: "This Month's Profit",
      value: summary ? formatCurrency(summary.monthProfit) : '—',
      valueClassName: summary ? (summary.monthProfit >= 0 ? 'text-[#0ca30c]' : 'text-[#d03b3b]') : undefined,
      icon: TrendingUp,
      accent: 'text-[#0ca30c] bg-emerald-50 dark:bg-emerald-500/10',
    },
  ];

  return (
    <div>
      <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100 mb-1">Welcome, {user?.name}</h1>
      <p className="text-slate-500 dark:text-slate-400 text-sm mb-6">Here's what's happening in your shop.</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.label}
              className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-4"
            >
              <div className={`inline-flex h-9 w-9 items-center justify-center rounded-lg mb-3 ${card.accent}`}>
                <Icon size={18} strokeWidth={2} />
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">{card.label}</p>
              <p className={`text-xl font-semibold ${card.valueClassName || 'text-slate-900 dark:text-slate-100'}`}>
                {card.value}
              </p>
            </div>
          );
        })}
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        {quickActions.map((action) => {
          const Icon = action.icon;
          return (
            <Link
              key={action.to}
              to={action.to}
              className="inline-flex items-center gap-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-700 hover:text-indigo-600 dark:hover:text-indigo-400 text-slate-700 dark:text-slate-300 text-sm font-medium rounded-lg px-3.5 py-2 shadow-sm transition-colors"
            >
              <Icon size={15} strokeWidth={2} />
              {action.label}
            </Link>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-4">
          <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-4">Sales — Last 7 Days</h2>
          {trend.length === 0 ? (
            <p className="text-sm text-slate-400 dark:text-slate-500 py-10 text-center">No sales in the last 7 days.</p>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={trend} margin={{ top: 4, right: 8, left: 0, bottom: 4 }}>
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

        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Low Stock Alerts</h2>
            <Link
              to="/reports"
              className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-0.5"
            >
              View all <ArrowRight size={12} />
            </Link>
          </div>
          {lowStock.length === 0 ? (
            <p className="text-sm text-slate-400 dark:text-slate-500 py-10 text-center">Nothing is low on stock.</p>
          ) : (
            <div className="space-y-2">
              {lowStock.slice(0, 5).map((p) => (
                <div
                  key={p._id}
                  className="flex items-center justify-between gap-3 text-sm border-b border-slate-100 dark:border-slate-800 last:border-0 pb-2 last:pb-0"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <Package size={14} className="text-slate-400 dark:text-slate-500 shrink-0" />
                    <span className="text-slate-900 dark:text-slate-100 truncate">{p.name}</span>
                  </div>
                  <span className="text-[#d03b3b] font-medium shrink-0">
                    {p.stockQty} {p.unit} left
                  </span>
                </div>
              ))}
              {lowStock.length > 5 && (
                <p className="text-xs text-slate-400 dark:text-slate-500 pt-1">
                  +{lowStock.length - 5} more item{lowStock.length - 5 === 1 ? '' : 's'} low on stock
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      <p className="text-slate-400 dark:text-slate-500 text-xs mt-6 flex items-center gap-1.5">
        <Receipt size={13} />
        See the Reports page for detailed sales trends, top products, and profit &amp; loss breakdowns.
      </p>
    </div>
  );
}