'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { api } from '@/lib/api';
import type { ApiProject } from '@the-swagger/shared';

export default function NewProjectPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    name: '',
    description: '',
    status: 'PLANNING',
    startDate: '',
    endDate: '',
    budget: '',
    location: '',
    clientName: '',
  });

  const set = (field: string, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const payload = {
        ...form,
        budget: form.budget ? Number(form.budget) : undefined,
        startDate: form.startDate || undefined,
        endDate: form.endDate || undefined,
        description: form.description || undefined,
        location: form.location || undefined,
        clientName: form.clientName || undefined,
      };
      const project = await api.post<ApiProject>('/projects', payload);
      router.push(`/projects/${project.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create project');
    } finally {
      setLoading(false);
    }
  };

  const Field = ({
    label, name, type = 'text', placeholder, required,
  }: {
    label: string; name: string; type?: string; placeholder?: string; required?: boolean;
  }) => (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-1.5">
        {label} {required && <span className="text-red-400">*</span>}
      </label>
      <input
        type={type}
        value={(form as any)[name]}
        onChange={(e) => set(name, e.target.value)}
        placeholder={placeholder}
        required={required}
        className="w-full px-3 py-2.5 rounded-lg border border-slate-300 text-slate-800 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
      />
    </div>
  );

  return (
    <div className="p-6 lg:p-8 max-w-2xl mx-auto">
      <Link
        href="/projects"
        className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 mb-6"
      >
        <ArrowLeft size={14} /> Back to Projects
      </Link>

      <div className="bg-white rounded-xl border border-slate-200 p-6 lg:p-8">
        <h1 className="text-xl font-bold text-slate-800 mb-1">Create New Project</h1>
        <p className="text-slate-500 text-sm mb-6">
          Fill in the details below to set up your project workspace.
        </p>

        {error && (
          <div className="mb-5 px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <Field label="Project Name" name="name" placeholder="e.g. Horizon Tower – Commercial Fit-Out" required />

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Description</label>
            <textarea
              value={form.description}
              onChange={(e) => set('description', e.target.value)}
              rows={3}
              placeholder="Brief overview of the project scope…"
              className="w-full px-3 py-2.5 rounded-lg border border-slate-300 text-slate-800 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Status</label>
              <select
                value={form.status}
                onChange={(e) => set('status', e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg border border-slate-300 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 bg-white"
              >
                {['PLANNING', 'ACTIVE', 'ON_HOLD', 'COMPLETED', 'CANCELLED'].map((s) => (
                  <option key={s} value={s}>{s.replace('_', ' ')}</option>
                ))}
              </select>
            </div>
            <Field label="Budget (USD)" name="budget" type="number" placeholder="e.g. 2400000" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Start Date" name="startDate" type="date" />
            <Field label="End Date" name="endDate" type="date" />
          </div>

          <Field label="Client Name" name="clientName" placeholder="e.g. Horizon Holdings Ltd." />
          <Field label="Location" name="location" placeholder="e.g. Dubai, UAE" />

          <div className="flex gap-3 pt-2">
            <Link
              href="/projects"
              className="flex-1 py-2.5 px-4 border border-slate-300 text-slate-700 font-medium rounded-lg text-sm text-center hover:bg-slate-50 transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-2.5 px-4 bg-amber-500 hover:bg-amber-400 disabled:opacity-60 text-slate-900 font-semibold rounded-lg text-sm flex items-center justify-center gap-2 transition-colors"
            >
              {loading && <Loader2 size={14} className="animate-spin" />}
              {loading ? 'Creating…' : 'Create Project'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
