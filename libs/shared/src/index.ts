// Shared types and constants used across api + web

export type UserRole = 'ADMIN' | 'DESIGN_MANAGER' | 'CLIENT' | 'CONTRACTOR' | 'VIEWER';
export type ProjectStatus = 'PLANNING' | 'ACTIVE' | 'ON_HOLD' | 'COMPLETED' | 'CANCELLED';
export type MilestoneStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'DELAYED';
export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'REVIEW' | 'DONE';

export const ROLE_LABELS: Record<UserRole, string> = {
  ADMIN: 'Admin',
  DESIGN_MANAGER: 'Design Manager',
  CLIENT: 'Client',
  CONTRACTOR: 'Contractor',
  VIEWER: 'Viewer',
};

export const PROJECT_STATUS_LABELS: Record<ProjectStatus, string> = {
  PLANNING: 'Planning',
  ACTIVE: 'Active',
  ON_HOLD: 'On Hold',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled',
};

export const MILESTONE_STATUS_LABELS: Record<MilestoneStatus, string> = {
  PENDING: 'Pending',
  IN_PROGRESS: 'In Progress',
  COMPLETED: 'Completed',
  DELAYED: 'Delayed',
};

export const TASK_STATUS_LABELS: Record<TaskStatus, string> = {
  TODO: 'To Do',
  IN_PROGRESS: 'In Progress',
  REVIEW: 'In Review',
  DONE: 'Done',
};

export const TASK_PRIORITY_LABELS: Record<TaskPriority, string> = {
  LOW: 'Low',
  MEDIUM: 'Medium',
  HIGH: 'High',
  URGENT: 'Urgent',
};

// API response types
export interface ApiUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  isActive: boolean;
  emailVerified: boolean;
  avatar?: string;
  phone?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ApiProject {
  id: string;
  name: string;
  description?: string;
  status: ProjectStatus;
  startDate?: string;
  endDate?: string;
  budget?: number;
  spent?: number;
  location?: string;
  clientName?: string;
  thumbnail?: string;
  ownerId: string;
  owner: Pick<ApiUser, 'id' | 'firstName' | 'lastName' | 'email'>;
  createdAt: string;
  updatedAt: string;
  _count: { milestones: number; tasks: number; documents: number };
}

export interface ApiMilestone {
  id: string;
  title: string;
  description?: string;
  status: MilestoneStatus;
  dueDate?: string;
  completedAt?: string;
  order: number;
  projectId: string;
  createdAt: string;
  updatedAt: string;
  _count: { tasks: number };
}

export interface ApiTask {
  id: string;
  title: string;
  description?: string;
  priority: TaskPriority;
  status: TaskStatus;
  dueDate?: string;
  completedAt?: string;
  projectId: string;
  milestoneId?: string;
  assigneeId?: string;
  creatorId: string;
  createdAt: string;
  updatedAt: string;
}
