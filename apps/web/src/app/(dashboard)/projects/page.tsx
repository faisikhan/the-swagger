'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  FolderKanban, Plus, Search, MapPin, Calendar, DollarSign, ArrowRight,
} from 'lucide-react';
import { api } from '@/lib/api';
import { useAuth } from '@/hooks/use-auth';
import { formatCurrency, formatDate, budgetProgress } from '@/lib/utils';
import type { ApiProject, ProjectStatus } from '@the-swagger/shared';
import { PROJECT_STATUS_LABELS } from '@the-swagger/shared';

const STATUS_COLORS: Record<string, string> = {
  PLANNING: 'bg-blue-100 text-blue-700 border-blue-200',
  ACTIVE: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  ON_HOLD: 'bg-amber-100 text-amber-700 border-amber-200',
  COMPLETED: 'bg-slate-100 text-slate-600 border-slate-200',
  CANCELLED: 'bg-red-100 text-red-700 border-red-200',
};

const STATUS_FILTERS: Array<{ label: string; value: string }> = [
  { label: 'All', value: '' },
  ...Object.entries(PROJECT_STATUS_LABELS).map(([value, label]) => ({ label, value })),
];

export default function ProjectsPage() {
  const { user } = useAuth();
  const [projects, setProjects] = useState<ApiProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const canCreate = user?.role === 'ADMIN' || user?.role === 'DESIGN_MANAGER';

  useEffect(() => {
    api.get<ApiProject[]>('/projects')
      .then(setProjects)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtered = projects.filter((p) => {
    const matchSearch =
      !search ||
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.clientName?.toLowerCase().includes(search.toLowerCase()) ||
      p.location?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = !statusFilter || p.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Projects</h1>
          <p className="text-slate-500 text-sm mt-1">{projects.length} projects in your workspace</p>
        </div>
        {canCreate && (
          <Link
            href="/projects/new"
            className="flex items-center gap-2 px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-900 font-semibold rounded-lg text-sm transition-colors"
          >
            <Plus size={16} />
            New Project
          </Link>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search projects…"
            className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-300 text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-400 bg-white"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {STATUS_FILTERS.map(({ label, value }) => (
            <button
              key={value}
              onClick={() => setStatusFilter(value)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors ${
                statusFilter === value
                  ? 'bg-slate-800 text-white border-slate-800'
                  : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-56 bg-slate-100 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-dashed border-slate-300 py-16 text-center">
          <FolderKanban size={36} className="text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500 text-sm font-medium">No projects found</p>
          <p className="text-slate-400 text-xs mt-1">Try adjusting your search or filters</p>
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((project) => (
            <Link key={project.id} href={`/projects/${project.id}`}>
              <div className="bg-white rounded-xl border border-slate-200 hover:shadow-lg hover:border-amber-300 transition-all cursor-pointer group flex flex-col h-full">
                {/* Card top */}
                <div className="p-5 flex-1">
                  <div className="flex items-start justify-between mb-3">
                    <span
                      className={`text-xs font-medium px-2.5 py-1 rounded-full border ${STATUS_COLORS[project.status]}`}
                    >
                      {PROJECT_STATUS_LABELS[project.status]}
                    </span>
                    <ArrowRight
                      size={14}
                      className="text-slate-300 group-hover:text-amber-500 transition-colors shrink-0 mt-0.5"
                    />
                  </div>

                  <h3 className="font-semibold text-slate-800 mb-1 line-clamp-2">{project.name}</h3>

                  {project.description && (
                    <p className="text-xs text-slate-400 line-clamp-2 mb-3">{project.description}</p>
                  )}

                  <div className="space-y-1.5 text-xs text-slate-500">
                    {project.clientName && (
                      <p className="flex items-center gap-1.5">
                        <span className="text-slate-300">👤</span> {project.clientName}
                      </p>
                    )}
                    {project.location && (
                      <p className="flex items-center gap-1.5">
                        <MapPin size={11} className="text-slate-300 shrink-0" />
                        {project.location}
                      </p>
                    )}
                    {project.endDate && (
                      <p className="flex items-center gap-1.5">
                        <Calendar size={11} className="text-slate-300 shrink-0" />
                        Due {formatDate(project.endDate)}
                      </p>
                    )}
                  </div>
                </div>

                {/* Card bottom */}
                <div className="px-5 py-4 border-t border-slate-100">
                  {project.budget ? (
                    <>
                      <div className="flex justify-between text-xs text-slate-500 mb-1.5">
                        <span className="flex items-center gap-1">
                          <DollarSign size={11} />
                          {formatCurrency(Number(project.spent))} spent
                        </span>
                        <span>{formatCurrency(Number(project.budget))}</span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${
                            budgetProgress(Number(project.spent), Number(project.budget)) > 90
                              ? 'bg-red-400'
                              : 'bg-amber-400'
                          }`}
                          style={{
                            width: `${budgetProgress(Number(project.spent), Number(project.budget))}%`,
                          }}
                        />
                      </div>
                    </>
                  ) : (
                    <p className="text-xs text-slate-400">No budget set</p>
                  )}
                  <div className="flex gap-3 mt-2 text-xs text-slate-400">
                    <span>{project._count.milestones} milestones</span>
                    <span>·</span>
                    <span>{project._count.tasks} tasks</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
