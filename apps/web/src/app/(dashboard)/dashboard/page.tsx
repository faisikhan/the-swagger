'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  FolderKanban, CheckSquare, Users, TrendingUp,
  ArrowRight, Clock, AlertCircle,
} from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { api } from '@/lib/api';
import { formatCurrency, formatDate, budgetProgress } from '@/lib/utils';
import type { ApiProject } from '@the-swagger/shared';
import {
  PROJECT_STATUS_LABELS,
} from '@the-swagger/shared';

const STATUS_COLORS: Record<string, string> = {
  PLANNING: 'bg-blue-100 text-blue-700',
  ACTIVE: 'bg-emerald-100 text-emerald-700',
  ON_HOLD: 'bg-amber-100 text-amber-700',
  COMPLETED: 'bg-slate-100 text-slate-600',
  CANCELLED: 'bg-red-100 text-red-700',
};

export default function DashboardPage() {
  const { user } = useAuth();
  const [projects, setProjects] = useState<ApiProject[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get<ApiProject[]>('/projects')
      .then(setProjects)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const active = projects.filter((p) => p.status === 'ACTIVE');
  const totalBudget = projects.reduce((s, p) => s + Number(p.budget ?? 0), 0);
  const totalSpent = projects.reduce((s, p) => s + Number(p.spent ?? 0), 0);
  const totalTasks = projects.reduce((s, p) => s + p._count.tasks, 0);

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800">
          Good morning, {user?.firstName} 👋
        </h1>
        <p className="text-slate-500 mt-1 text-sm">
          Here&apos;s what&apos;s happening across your projects today.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: 'Total Projects',
            value: projects.length,
            icon: FolderKanban,
            color: 'text-blue-600',
            bg: 'bg-blue-50',
          },
          {
            label: 'Active Projects',
            value: active.length,
            icon: TrendingUp,
            color: 'text-emerald-600',
            bg: 'bg-emerald-50',
          },
          {
            label: 'Total Tasks',
            value: totalTasks,
            icon: CheckSquare,
            color: 'text-violet-600',
            bg: 'bg-violet-50',
          },
          {
            label: 'Total Budget',
            value: formatCurrency(totalBudget),
            icon: Users,
            color: 'text-amber-600',
            bg: 'bg-amber-50',
          },
        ].map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="bg-white rounded-xl border border-slate-200 p-5">
            <div className={`w-10 h-10 rounded-lg ${bg} flex items-center justify-center mb-3`}>
              <Icon size={20} className={color} />
            </div>
            <p className="text-2xl font-bold text-slate-800">{value}</p>
            <p className="text-slate-500 text-sm mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Budget overview */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-slate-800">Portfolio Budget</h2>
          <span className="text-sm text-slate-500">
            {formatCurrency(totalSpent)} of {formatCurrency(totalBudget)}
          </span>
        </div>
        <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-amber-500 rounded-full transition-all"
            style={{ width: `${budgetProgress(totalSpent, totalBudget)}%` }}
          />
        </div>
        <p className="text-xs text-slate-400 mt-2">
          {budgetProgress(totalSpent, totalBudget)}% of total portfolio budget utilised
        </p>
      </div>

      {/* Recent projects */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-slate-800">Recent Projects</h2>
          <Link
            href="/projects"
            className="flex items-center gap-1 text-sm text-amber-600 hover:text-amber-500 font-medium"
          >
            View all <ArrowRight size={14} />
          </Link>
        </div>

        {loading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-44 bg-slate-100 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : projects.length === 0 ? (
          <div className="bg-white rounded-xl border border-dashed border-slate-300 p-10 text-center">
            <FolderKanban size={32} className="text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 text-sm">No projects yet.</p>
            <Link
              href="/projects/new"
              className="mt-3 inline-block text-sm text-amber-600 font-medium hover:text-amber-500"
            >
              Create your first project →
            </Link>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {projects.slice(0, 6).map((project) => (
              <Link key={project.id} href={`/projects/${project.id}`}>
                <div className="bg-white rounded-xl border border-slate-200 p-5 hover:shadow-md hover:border-amber-300 transition-all cursor-pointer group h-full flex flex-col">
                  <div className="flex items-start justify-between mb-3">
                    <span
                      className={`text-xs font-medium px-2.5 py-1 rounded-full ${STATUS_COLORS[project.status]}`}
                    >
                      {PROJECT_STATUS_LABELS[project.status]}
                    </span>
                    <ArrowRight
                      size={14}
                      className="text-slate-300 group-hover:text-amber-500 transition-colors mt-0.5"
                    />
                  </div>

                  <h3 className="font-semibold text-slate-800 text-sm mb-1 line-clamp-2 flex-1">
                    {project.name}
                  </h3>

                  {project.clientName && (
                    <p className="text-xs text-slate-400 mb-3">{project.clientName}</p>
                  )}

                  {/* Budget bar */}
                  {project.budget && (
                    <div className="mb-3">
                      <div className="flex justify-between text-xs text-slate-400 mb-1">
                        <span>Budget</span>
                        <span>{budgetProgress(Number(project.spent), Number(project.budget))}%</span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-amber-400 rounded-full"
                          style={{
                            width: `${budgetProgress(Number(project.spent), Number(project.budget))}%`,
                          }}
                        />
                      </div>
                    </div>
                  )}

                  <div className="flex items-center gap-3 text-xs text-slate-400 mt-auto pt-3 border-t border-slate-100">
                    <span className="flex items-center gap-1">
                      <CheckSquare size={12} />
                      {project._count.tasks} tasks
                    </span>
                    {project.endDate && (
                      <span className="flex items-center gap-1">
                        <Clock size={12} />
                        {formatDate(project.endDate)}
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
