import { AlertTriangle, TrendingUp, Users2, Wallet } from 'lucide-react';
import { useEffect, useState } from 'react';
import * as reportsApi from '../api/reports';
import { useAuth } from '../context/AuthContext';
import { formatCurrency } from '../utils/format';

export default function Dashboard() {
  const { user } = useAuth();
  const [summary, setSummary] = useState(null);

  useEffect(() => {
    reportsApi.getDashboardSummary().then(setSummary).catch(() => {});
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

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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

      <p className="text-slate-400 dark:text-slate-500 text-xs mt-6">
        See the Reports page for detailed sales trends, top products, and profit &amp; loss breakdowns.
      </p>
    </div>
  );
}
