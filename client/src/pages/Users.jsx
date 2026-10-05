import { useEffect, useState } from 'react';
import * as authApi from '../api/auth';
import Modal from '../components/Modal';
import { useAuth } from '../context/AuthContext';

const emptyForm = { name: '', username: '', password: '', role: 'staff' };

export default function Users() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const [resetTarget, setResetTarget] = useState(null);
  const [newPassword, setNewPassword] = useState('');
  const [resetError, setResetError] = useState('');
  const [resetting, setResetting] = useState(false);

  const [statusError, setStatusError] = useState('');
  const [statusBusyId, setStatusBusyId] = useState(null);

  function load() {
    authApi.listUsers().then(setUsers).catch(() => {});
  }

  useEffect(load, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      await authApi.createUser(form);
      setModalOpen(false);
      setForm(emptyForm);
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create account');
    } finally {
      setSaving(false);
    }
  }

  function openReset(u) {
    setResetTarget(u);
    setNewPassword('');
    setResetError('');
  }

  async function handleReset(e) {
    e.preventDefault();
    setResetError('');
    if (newPassword.length < 4) {
      return setResetError('Password must be at least 4 characters');
    }
    setResetting(true);
    try {
      await authApi.resetUserPassword(resetTarget._id, newPassword);
      setResetTarget(null);
    } catch (err) {
      setResetError(err.response?.data?.message || 'Failed to reset password');
    } finally {
      setResetting(false);
    }
  }

  async function toggleActive(u) {
    setStatusError('');
    const nextActive = !u.active;
    const verb = nextActive ? 'reactivate' : 'deactivate';
    if (!window.confirm(`${verb === 'reactivate' ? 'Reactivate' : 'Deactivate'} ${u.name}'s account?`)) return;

    setStatusBusyId(u._id);
    try {
      await authApi.setUserActive(u._id, nextActive);
      load();
    } catch (err) {
      setStatusError(err.response?.data?.message || `Failed to ${verb} account`);
    } finally {
      setStatusBusyId(null);
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">Staff Accounts</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm">Create logins for cashiers/staff.</p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg px-4 py-2 shadow-sm shadow-indigo-600/20"
        >
          + Add Account
        </button>
      </div>

      {statusError && (
        <p className="text-sm text-red-600 dark:text-red-400 mb-3">{statusError}</p>
      )}

      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-x-auto">
        <table className="min-w-full text-sm whitespace-nowrap">
          <thead>
            <tr className="text-left text-xs text-slate-500 dark:text-slate-400 uppercase border-b border-slate-200 dark:border-slate-800">
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Username</th>
              <th className="px-4 py-3">Role</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => {
              const isSelf = u._id === currentUser?.id;
              return (
                <tr key={u._id} className="border-b border-slate-100 dark:border-slate-800 last:border-0 hover:bg-slate-50 dark:hover:bg-slate-800/50">
                  <td className="px-4 py-3 font-medium text-slate-900 dark:text-slate-100">
                    {u.name}
                    {isSelf && <span className="ml-2 text-xs text-slate-400 font-normal">(you)</span>}
                  </td>
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{u.username}</td>
                  <td className="px-4 py-3 capitalize text-slate-600 dark:text-slate-400">{u.role}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`text-xs font-medium rounded-full px-2 py-0.5 ${
                        u.active
                          ? 'text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10'
                          : 'text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800'
                      }`}
                    >
                      {u.active ? 'Active' : 'Deactivated'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right space-x-3 whitespace-nowrap">
                    <button
                      onClick={() => openReset(u)}
                      className="text-indigo-600 dark:text-indigo-400 hover:underline text-xs font-medium"
                    >
                      Reset password
                    </button>
                    <button
                      onClick={() => toggleActive(u)}
                      disabled={isSelf || statusBusyId === u._id}
                      title={isSelf ? "You can't deactivate your own account" : undefined}
                      className={`text-xs font-medium hover:underline disabled:opacity-40 disabled:hover:no-underline disabled:cursor-not-allowed ${
                        u.active ? 'text-red-600 dark:text-red-400' : 'text-emerald-600 dark:text-emerald-400'
                      }`}
                    >
                      {statusBusyId === u._id ? 'Working…' : u.active ? 'Deactivate' : 'Reactivate'}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Add Staff Account">
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Name</label>
            <input
              className="w-full rounded-lg border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 px-3 py-2 text-sm"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Username</label>
            <input
              className="w-full rounded-lg border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 px-3 py-2 text-sm"
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
              required
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Password</label>
            <input
              type="password"
              className="w-full rounded-lg border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 px-3 py-2 text-sm"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Role</label>
            <select
              className="w-full rounded-lg border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 px-3 py-2 text-sm"
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value })}
            >
              <option value="staff">Staff</option>
              <option value="owner">Owner</option>
            </select>
          </div>
          {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
          <button
            type="submit"
            disabled={saving}
            className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white font-medium rounded-lg py-2 text-sm shadow-sm shadow-indigo-600/20"
          >
            {saving ? 'Creating…' : 'Create Account'}
          </button>
        </form>
      </Modal>

      <Modal
        open={!!resetTarget}
        onClose={() => setResetTarget(null)}
        title={resetTarget ? `Reset password — ${resetTarget.name}` : ''}
      >
        <form onSubmit={handleReset} className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
              New password
            </label>
            <input
              type="password"
              autoFocus
              className="w-full rounded-lg border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 px-3 py-2 text-sm"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
          </div>
          {resetError && <p className="text-sm text-red-600 dark:text-red-400">{resetError}</p>}
          <button
            type="submit"
            disabled={resetting}
            className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white font-medium rounded-lg py-2 text-sm shadow-sm shadow-indigo-600/20"
          >
            {resetting ? 'Saving…' : 'Set New Password'}
          </button>
        </form>
      </Modal>
    </div>
  );
}