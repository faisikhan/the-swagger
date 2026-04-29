'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { AuthProvider } from '@/hooks/use-auth';

function LoginForm() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const fill = (e: string, p: string) => { setEmail(e); setPassword(p); };

  return (
    <div className="w-full max-w-md">
      {/* Logo */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-amber-500 mb-4">
          <span className="text-2xl font-black text-slate-900">S</span>
        </div>
        <h1 className="text-2xl font-bold text-white">The Swagger</h1>
        <p className="text-slate-400 text-sm mt-1">Design & construction project management</p>
      </div>

      {/* Card */}
      <div className="bg-white rounded-2xl shadow-2xl p-8">
        <h2 className="text-xl font-semibold text-slate-800 mb-6">Sign in to your workspace</h2>

        {error && (
          <div className="mb-4 px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@devopsmolvi.com"
              required
              className="w-full px-3 py-2.5 rounded-lg border border-slate-300 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="w-full px-3 py-2.5 rounded-lg border border-slate-300 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent text-sm"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 px-4 bg-amber-500 hover:bg-amber-400 disabled:opacity-60 disabled:cursor-not-allowed text-slate-900 font-semibold rounded-lg transition-colors text-sm"
          >
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        {/* Quick-fill test accounts */}
        <div className="mt-6 pt-5 border-t border-slate-100">
          <p className="text-xs text-slate-500 font-medium mb-2">Quick login — test accounts</p>
          <div className="grid grid-cols-2 gap-2">
            {[
              { label: 'Admin', email: 'admin@devopsmolvi.com' },
              { label: 'Manager', email: 'manager@devopsmolvi.com' },
              { label: 'Client', email: 'client@devopsmolvi.com' },
              { label: 'Contractor', email: 'contractor@devopsmolvi.com' },
            ].map(({ label, email: e }) => (
              <button
                key={label}
                type="button"
                onClick={() => fill(e, 'Password123!')}
                className="px-3 py-1.5 text-xs bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg transition-colors text-left"
              >
                <span className="font-medium">{label}</span>
                <br />
                <span className="text-slate-400 truncate block">{e}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <AuthProvider>
      <LoginForm />
    </AuthProvider>
  );
}
