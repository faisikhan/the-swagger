'use client';

import { useEffect, useState } from 'react';
import { Users, Shield, Mail, Phone } from 'lucide-react';
import { api } from '@/lib/api';
import { useAuth } from '@/hooks/use-auth';
import { initials } from '@/lib/utils';
import type { ApiUser } from '@the-swagger/shared';
import { ROLE_LABELS } from '@the-swagger/shared';

const ROLE_COLORS: Record<string, string> = {
  ADMIN: 'bg-red-100 text-red-700',
  DESIGN_MANAGER: 'bg-violet-100 text-violet-700',
  CLIENT: 'bg-blue-100 text-blue-700',
  CONTRACTOR: 'bg-amber-100 text-amber-700',
  VIEWER: 'bg-slate-100 text-slate-600',
};

export default function UsersPage() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<ApiUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get<ApiUser[]>('/users')
      .then(setUsers)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="p-6 lg:p-8 max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Team</h1>
        <p className="text-slate-500 text-sm mt-1">
          {users.length > 0 ? `${users.length} workspace members` : 'Workspace members'}
        </p>
      </div>

      {error && (
        <div className="px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
          {error}
        </div>
      )}

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-28 bg-slate-100 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {users.map((u) => (
            <div
              key={u.id}
              className={`bg-white rounded-xl border p-5 flex gap-4 items-start ${
                u.id === currentUser?.id ? 'border-amber-300 ring-1 ring-amber-200' : 'border-slate-200'
              }`}
            >
              <div className="w-11 h-11 rounded-full bg-amber-100 text-amber-700 font-bold flex items-center justify-center text-sm shrink-0">
                {u.avatar ? (
                  <img src={u.avatar} alt="" className="w-full h-full rounded-full object-cover" />
                ) : (
                  initials(u.firstName, u.lastName)
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-semibold text-slate-800 text-sm">
                    {u.firstName} {u.lastName}
                  </p>
                  {u.id === currentUser?.id && (
                    <span className="text-xs bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-full">
                      You
                    </span>
                  )}
                </div>
                <span
                  className={`inline-block text-xs font-medium px-2 py-0.5 rounded-full mt-1 ${ROLE_COLORS[u.role]}`}
                >
                  {ROLE_LABELS[u.role]}
                </span>
                <p className="text-xs text-slate-400 mt-1.5 flex items-center gap-1 truncate">
                  <Mail size={11} className="shrink-0" />
                  {u.email}
                </p>
                {u.phone && (
                  <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1">
                    <Phone size={11} className="shrink-0" />
                    {u.phone}
                  </p>
                )}
                <div className="flex items-center gap-1 mt-2">
                  <div
                    className={`w-1.5 h-1.5 rounded-full ${u.isActive ? 'bg-emerald-400' : 'bg-slate-300'}`}
                  />
                  <span className="text-xs text-slate-400">{u.isActive ? 'Active' : 'Inactive'}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
