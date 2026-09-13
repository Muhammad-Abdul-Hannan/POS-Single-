import {
  LayoutDashboard,
  Menu,
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
  X,
} from 'lucide-react';
import { useState } from 'react';
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
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen flex bg-slate-50 dark:bg-slate-950">
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 shrink-0 bg-slate-900 text-slate-200 flex flex-col border-r border-slate-800 transition-transform duration-200 lg:sticky lg:top-0 lg:h-screen lg:translate-x-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="px-5 py-5 text-lg font-semibold text-white border-b border-slate-800 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-600 text-sm shrink-0">
              S
            </span>
            <span className="truncate">Shop Manager</span>
          </div>
          <button
            onClick={() => setMobileOpen(false)}
            aria-label="Close menu"
            className="lg:hidden text-slate-400 hover:text-white shrink-0"
          >
            <X size={20} />
          </button>
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
                  onClick={() => setMobileOpen(false)}
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
          <div className="flex items-center justify-between mb-3 gap-2">
            <div className="min-w-0">
              <p className="text-white font-medium truncate">{user?.name}</p>
              <p className="text-slate-400 text-xs capitalize">{user?.role}</p>
            </div>
            <button
              onClick={toggleTheme}
              aria-label="Toggle theme"
              className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white transition-colors shrink-0"
            >
              {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
            </button>
          </div>
          <button onClick={logout} className="text-xs text-slate-400 hover:text-white underline">
            Sign out
          </button>
        </div>
      </aside>

      <div className="flex-1 min-w-0 flex flex-col">
        <div className="lg:hidden sticky top-0 z-30 flex items-center gap-3 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 py-3">
          <button
            onClick={() => setMobileOpen(true)}
            aria-label="Open menu"
            className="text-slate-600 dark:text-slate-300"
          >
            <Menu size={22} />
          </button>
          <span className="font-semibold text-slate-900 dark:text-slate-100">Shop Manager</span>
        </div>

        <main className="flex-1 min-w-0 overflow-y-auto">
          <div className="max-w-6xl mx-auto p-4 sm:p-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
