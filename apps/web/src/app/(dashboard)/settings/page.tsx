'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { api } from '@/lib/api';
import { initials } from '@/lib/utils';
import { Loader2, User, Lock, Bell } from 'lucide-react';

export default function SettingsPage() {
  const { user, refresh } = useAuth();
  const [tab, setTab] = useState<'profile' | 'security'>('profile');

  const [form, setForm] = useState({
    firstName: user?.firstName ?? '',
    lastName: user?.lastName ?? '',
    phone: user?.phone ?? '',
  });
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccess('');
    setError('');
    try {
      await api.patch(`/users/${user?.id}`, form);
      await refresh();
      setSuccess('Profile updated successfully.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Update failed');
    } finally {
      setSaving(false);
    }
  };

  const TABS = [
    { id: 'profile' as const, label: 'Profile', icon: User },
    { id: 'security' as const, label: 'Security', icon: Lock },
  ];

  return (
    <div className="p-6 lg:p-8 max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Settings</h1>
        <p className="text-slate-500 text-sm mt-1">Manage your account preferences</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-slate-200">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
              tab === id
                ? 'border-amber-500 text-amber-600'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <Icon size={15} />
            {label}
          </button>
        ))}
      </div>

      {tab === 'profile' && (
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          {/* Avatar */}
          <div className="flex items-center gap-4 mb-6 pb-6 border-b border-slate-100">
            <div className="w-16 h-16 rounded-full bg-amber-100 text-amber-700 font-bold text-xl flex items-center justify-center">
              {user ? initials(user.firstName, user.lastName) : '?'}
            </div>
            <div>
              <p className="font-semibold text-slate-800">
                {user?.firstName} {user?.lastName}
              </p>
              <p className="text-slate-400 text-sm">{user?.email}</p>
              <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full mt-1 inline-block">
                {user?.role?.replace('_', ' ')}
              </span>
            </div>
          </div>

          {success && (
            <div className="mb-4 px-4 py-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm">
              {success}
            </div>
          )}
          {error && (
            <div className="mb-4 px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: 'First Name', key: 'firstName' },
                { label: 'Last Name', key: 'lastName' },
              ].map(({ label, key }) => (
                <div key={key}>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">{label}</label>
                  <input
                    type="text"
                    value={(form as any)[key]}
                    onChange={(e) => setForm((prev) => ({ ...prev, [key]: e.target.value }))}
                    className="w-full px-3 py-2.5 rounded-lg border border-slate-300 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                  />
                </div>
              ))}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Email</label>
              <input
                type="email"
                value={user?.email ?? ''}
                disabled
                className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-slate-400 text-sm bg-slate-50 cursor-not-allowed"
              />
              <p className="text-xs text-slate-400 mt-1">Email cannot be changed here.</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Phone</label>
              <input
                type="tel"
                value={form.phone}
                onChange={(e) => setForm((prev) => ({ ...prev, phone: e.target.value }))}
                placeholder="+971 50 123 4567"
                className="w-full px-3 py-2.5 rounded-lg border border-slate-300 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
              />
            </div>

            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 px-5 py-2.5 bg-amber-500 hover:bg-amber-400 disabled:opacity-60 text-slate-900 font-semibold rounded-lg text-sm transition-colors"
            >
              {saving && <Loader2 size={14} className="animate-spin" />}
              {saving ? 'Saving…' : 'Save Changes'}
            </button>
          </form>
        </div>
      )}

      {tab === 'security' && (
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h2 className="font-semibold text-slate-800 mb-1">Password & Security</h2>
          <p className="text-slate-500 text-sm mb-6">
            Password changes are handled via the API. Use the{' '}
            <a
              href="http://localhost:4200/api/docs"
              target="_blank"
              rel="noopener noreferrer"
              className="text-amber-600 hover:underline"
            >
              Swagger UI
            </a>{' '}
            to update your credentials directly.
          </p>

          <div className="space-y-3">
            {[
              { label: 'Two-Factor Authentication', value: 'Not configured', action: 'Set up' },
              { label: 'Active Sessions', value: '1 session (this device)', action: 'Manage' },
            ].map(({ label, value, action }) => (
              <div
                key={label}
                className="flex items-center justify-between px-4 py-3 rounded-lg border border-slate-200"
              >
                <div>
                  <p className="text-sm font-medium text-slate-700">{label}</p>
                  <p className="text-xs text-slate-400">{value}</p>
                </div>
                <button className="text-xs text-amber-600 hover:text-amber-500 font-medium">
                  {action}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
