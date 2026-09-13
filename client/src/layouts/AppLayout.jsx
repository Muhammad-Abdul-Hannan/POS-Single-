import {
  LayoutDashboard,
  Moon,
  Package,
  Receipt,
  ShoppingCart,
  Sun,
  Truck,
  Users2,
  UserSquare2,
  Wallet,
  Wheat,
} from 'lucide-react';
import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const navItems = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, ownerOnly: true },
  { to: '/pos', label: 'Billing (POS)', icon: ShoppingCart },
  { to: '/grinding', label: 'Grinding Service', icon: Wheat },
  { to: '/products', label: 'Products / Stock', icon: Package },
  { to: '/customers', label: 'Customers (Udhaar)', icon: UserSquare2 },
  { to: '/sales-history', label: 'Sales History', icon: Receipt, ownerOnly: true },
  { to: '/suppliers', label: 'Suppliers', icon: Truck, ownerOnly: true },
  { to: '/purchases', label: 'Purchases', icon: ShoppingCart, ownerOnly: true },
  { to: '/expenses', label: 'Expenses', icon: Wallet, ownerOnly: true },
  { to: '/reports', label: 'Reports', icon: LayoutDashboard, ownerOnly: true },
  { to: '/users', label: 'Staff Accounts', icon: Users2, ownerOnly: true },
];

export default function AppLayout() {
  const { user, isOwner, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="min-h-screen flex bg-slate-50 dark:bg-slate-950">
      <aside className="w-60 shrink-0 bg-slate-900 text-slate-200 flex flex-col border-r border-slate-800 h-screen sticky top-0">
        <div className="px-5 py-5 text-lg font-semibold text-white border-b border-slate-800 flex items-center gap-2">
          <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-600 text-sm">
            S
          </span>
          Shop Manager
        </div>
        <nav className="flex-1 py-3 space-y-0.5 overflow-y-auto">
          {navItems
            .filter((item) => !item.ownerOnly || isOwner)
            .map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === '/'}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-5 py-2.5 text-sm transition-colors ${
                      isActive
                        ? 'bg-indigo-600 text-white font-medium'
                        : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                    }`
                  }
                >
                  <Icon size={16} strokeWidth={2} className="shrink-0" />
                  {item.label}
                </NavLink>
              );
            })}
        </nav>
        <div className="px-5 py-4 border-t border-slate-800 text-sm">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-white font-medium">{user?.name}</p>
              <p className="text-slate-400 text-xs capitalize">{user?.role}</p>
            </div>
            <button
              onClick={toggleTheme}
              aria-label="Toggle theme"
              className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white transition-colors"
            >
              {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
            </button>
          </div>
          <button onClick={logout} className="text-xs text-slate-400 hover:text-white underline">
            Sign out
          </button>
        </div>
      </aside>

      <main className="flex-1 min-w-0 overflow-y-auto">
        <div className="max-w-6xl mx-auto p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
