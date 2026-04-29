'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft, MapPin, Calendar, DollarSign, Users, CheckSquare,
  Flag, Plus, Loader2, Trash2, ChevronDown,
} from 'lucide-react';
import { api } from '@/lib/api';
import { useAuth } from '@/hooks/use-auth';
import { formatCurrency, formatDate, budgetProgress, cn, initials } from '@/lib/utils';
import type { ApiProject, ApiMilestone, ApiTask } from '@the-swagger/shared';
import {
  PROJECT_STATUS_LABELS, MILESTONE_STATUS_LABELS,
  TASK_STATUS_LABELS, TASK_PRIORITY_LABELS,
} from '@the-swagger/shared';

const STATUS_COLORS: Record<string, string> = {
  PLANNING: 'bg-blue-100 text-blue-700',
  ACTIVE: 'bg-emerald-100 text-emerald-700',
  ON_HOLD: 'bg-amber-100 text-amber-700',
  COMPLETED: 'bg-slate-100 text-slate-600',
  CANCELLED: 'bg-red-100 text-red-700',
};

const TASK_STATUS_COLORS: Record<string, string> = {
  TODO: 'bg-slate-100 text-slate-600',
  IN_PROGRESS: 'bg-blue-100 text-blue-700',
  REVIEW: 'bg-violet-100 text-violet-700',
  DONE: 'bg-emerald-100 text-emerald-700',
};

const PRIORITY_COLORS: Record<string, string> = {
  LOW: 'text-slate-400',
  MEDIUM: 'text-amber-500',
  HIGH: 'text-orange-500',
  URGENT: 'text-red-500',
};

type Tab = 'overview' | 'milestones' | 'tasks' | 'team';

export default function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>('overview');
  const [deleting, setDeleting] = useState(false);

  const canManage = user?.role === 'ADMIN' || user?.role === 'DESIGN_MANAGER';

  useEffect(() => {
    api.get(`/projects/${id}`)
      .then(setProject)
      .catch(() => router.push('/projects'))
      .finally(() => setLoading(false));
  }, [id, router]);

  const handleDelete = async () => {
    if (!confirm('Delete this project? This cannot be undone.')) return;
    setDeleting(true);
    try {
      await api.delete(`/projects/${id}`);
      router.push('/projects');
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Delete failed');
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="animate-spin text-amber-500" size={28} />
      </div>
    );
  }

  if (!project) return null;

  const TABS: Array<{ id: Tab; label: string; count?: number }> = [
    { id: 'overview', label: 'Overview' },
    { id: 'milestones', label: 'Milestones', count: project.milestones?.length },
    { id: 'tasks', label: 'Tasks', count: project.tasks?.length },
    { id: 'team', label: 'Team', count: project.members?.length },
  ];

  return (
    <div className="p-6 lg:p-8 max-w-6xl mx-auto space-y-6">
      {/* Back */}
      <Link
        href="/projects"
        className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700"
      >
        <ArrowLeft size={14} /> Projects
      </Link>

      {/* Header */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${STATUS_COLORS[project.status]}`}>
                {PROJECT_STATUS_LABELS[project.status as keyof typeof PROJECT_STATUS_LABELS]}
              </span>
              {project.location && (
                <span className="flex items-center gap-1 text-xs text-slate-400">
                  <MapPin size={11} /> {project.location}
                </span>
              )}
            </div>
            <h1 className="text-xl font-bold text-slate-800 mb-1">{project.name}</h1>
            {project.description && (
              <p className="text-sm text-slate-500">{project.description}</p>
            )}
            <div className="flex gap-4 mt-3 text-xs text-slate-400 flex-wrap">
              {project.clientName && <span>👤 {project.clientName}</span>}
              {project.startDate && (
                <span className="flex items-center gap-1">
                  <Calendar size={11} /> {formatDate(project.startDate)}
                  {project.endDate && <> → {formatDate(project.endDate)}</>}
                </span>
              )}
            </div>
          </div>

          {canManage && (
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="flex items-center gap-1.5 px-3 py-2 text-xs text-red-500 border border-red-200 rounded-lg hover:bg-red-50 transition-colors"
            >
              {deleting ? <Loader2 size={12} className="animate-spin" /> : <Trash2 size={12} />}
              Delete
            </button>
          )}
        </div>

        {/* Budget bar */}
        {project.budget && (
          <div className="mt-5 pt-5 border-t border-slate-100">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-slate-500 flex items-center gap-1">
                <DollarSign size={13} /> Budget
              </span>
              <span className="text-slate-700 font-medium">
                {formatCurrency(Number(project.spent))} / {formatCurrency(Number(project.budget))}
              </span>
            </div>
            <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full ${
                  budgetProgress(Number(project.spent), Number(project.budget)) > 90
                    ? 'bg-red-400'
                    : 'bg-amber-400'
                }`}
                style={{ width: `${budgetProgress(Number(project.spent), Number(project.budget))}%` }}
              />
            </div>
            <p className="text-xs text-slate-400 mt-1">
              {budgetProgress(Number(project.spent), Number(project.budget))}% utilised
            </p>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-200 flex gap-0">
        {TABS.map(({ id: tabId, label, count }) => (
          <button
            key={tabId}
            onClick={() => setTab(tabId)}
            className={cn(
              'px-5 py-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-1.5',
              tab === tabId
                ? 'border-amber-500 text-amber-600'
                : 'border-transparent text-slate-500 hover:text-slate-700',
            )}
          >
            {label}
            {count !== undefined && (
              <span className="text-xs bg-slate-100 text-slate-500 rounded-full px-1.5 py-0.5">
                {count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {tab === 'overview' && (
        <div className="grid gap-4 sm:grid-cols-3">
          {[
            { label: 'Milestones', value: project._count?.milestones ?? 0, icon: Flag },
            { label: 'Tasks', value: project._count?.tasks ?? 0, icon: CheckSquare },
            { label: 'Team Members', value: project.members?.length ?? 0, icon: Users },
          ].map(({ label, value, icon: Icon }) => (
            <div key={label} className="bg-white rounded-xl border border-slate-200 p-5 flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center shrink-0">
                <Icon size={18} className="text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-800">{value}</p>
                <p className="text-slate-500 text-sm">{label}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Milestones Tab */}
      {tab === 'milestones' && (
        <div className="space-y-3">
          {project.milestones?.length === 0 && (
            <p className="text-slate-400 text-sm text-center py-10">No milestones yet.</p>
          )}
          {project.milestones?.map((m: any, i: number) => (
            <div key={m.id} className="bg-white rounded-xl border border-slate-200 p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-full bg-amber-100 text-amber-700 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                    {i + 1}
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-800 text-sm">{m.title}</h3>
                    {m.description && <p className="text-xs text-slate-400 mt-0.5">{m.description}</p>}
                    {m.dueDate && (
                      <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                        <Calendar size={11} /> Due {formatDate(m.dueDate)}
                      </p>
                    )}
                  </div>
                </div>
                <span className={`text-xs font-medium px-2.5 py-1 rounded-full shrink-0 ${
                  m.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-700' :
                  m.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-700' :
                  m.status === 'DELAYED' ? 'bg-red-100 text-red-700' :
                  'bg-slate-100 text-slate-600'
                }`}>
                  {MILESTONE_STATUS_LABELS[m.status as keyof typeof MILESTONE_STATUS_LABELS]}
                </span>
              </div>
              {m.tasks?.length > 0 && (
                <div className="mt-3 pt-3 border-t border-slate-100">
                  <p className="text-xs text-slate-400 mb-2">{m.tasks.length} task{m.tasks.length !== 1 ? 's' : ''}</p>
                  <div className="space-y-1">
                    {m.tasks.slice(0, 3).map((t: any) => (
                      <div key={t.id} className="flex items-center gap-2 text-xs text-slate-600">
                        <div className={`w-1.5 h-1.5 rounded-full ${t.status === 'DONE' ? 'bg-emerald-400' : 'bg-slate-300'}`} />
                        {t.title}
                      </div>
                    ))}
                    {m.tasks.length > 3 && (
                      <p className="text-xs text-slate-400">+{m.tasks.length - 3} more</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Tasks Tab */}
      {tab === 'tasks' && (
        <div className="space-y-2">
          {project.tasks?.length === 0 && (
            <p className="text-slate-400 text-sm text-center py-10">No tasks yet.</p>
          )}
          {project.tasks?.map((t: any) => (
            <div key={t.id} className="bg-white rounded-xl border border-slate-200 px-5 py-4 flex items-center gap-4">
              <div className={`w-1.5 h-8 rounded-full shrink-0 ${
                t.priority === 'URGENT' ? 'bg-red-400' :
                t.priority === 'HIGH' ? 'bg-orange-400' :
                t.priority === 'MEDIUM' ? 'bg-amber-400' : 'bg-slate-200'
              }`} />
              <div className="flex-1 min-w-0">
                <p className="font-medium text-slate-800 text-sm truncate">{t.title}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  {t.milestone && (
                    <span className="text-xs text-slate-400">{t.milestone.title}</span>
                  )}
                  {t.dueDate && (
                    <span className="text-xs text-slate-400 flex items-center gap-0.5">
                      <Calendar size={10} /> {formatDate(t.dueDate)}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {t.assignee && (
                  <div className="w-6 h-6 rounded-full bg-slate-200 text-slate-600 text-xs font-bold flex items-center justify-center" title={`${t.assignee.firstName} ${t.assignee.lastName}`}>
                    {initials(t.assignee.firstName, t.assignee.lastName)}
                  </div>
                )}
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${TASK_STATUS_COLORS[t.status]}`}>
                  {TASK_STATUS_LABELS[t.status as keyof typeof TASK_STATUS_LABELS]}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Team Tab */}
      {tab === 'team' && (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {project.members?.map((m: any) => (
            <div key={m.id} className="bg-white rounded-xl border border-slate-200 p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-700 font-bold text-sm flex items-center justify-center shrink-0">
                {initials(m.user.firstName, m.user.lastName)}
              </div>
              <div className="min-w-0">
                <p className="font-medium text-slate-800 text-sm truncate">
                  {m.user.firstName} {m.user.lastName}
                </p>
                <p className="text-xs text-slate-400 truncate">{m.user.email}</p>
                <span className="text-xs text-amber-600 font-medium">{m.role.replace('_', ' ')}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
