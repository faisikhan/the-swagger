import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTaskDto, UpdateTaskDto, CreateCommentDto } from './dto/task.dto';
import { Role } from '@prisma/client';

const TASK_INCLUDE = {
  assignee: { select: { id: true, firstName: true, lastName: true, avatar: true } },
  creator: { select: { id: true, firstName: true, lastName: true } },
  milestone: { select: { id: true, title: true } },
  comments: {
    include: {
      user: { select: { id: true, firstName: true, lastName: true, avatar: true } },
    },
    orderBy: { createdAt: 'asc' as const },
  },
} as const;

@Injectable()
export class TasksService {
  constructor(private prisma: PrismaService) {}

  async create(projectId: string, dto: CreateTaskDto, creatorId: string, userRole: Role) {
    await this.assertAccess(projectId, creatorId, userRole);

    return this.prisma.task.create({
      data: {
        ...dto,
        dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined,
        projectId,
        creatorId,
      },
      include: TASK_INCLUDE,
    });
  }

  async findAllForProject(projectId: string, userId: string, userRole: Role) {
    await this.assertAccess(projectId, userId, userRole);

    return this.prisma.task.findMany({
      where: { projectId },
      include: TASK_INCLUDE,
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string, userId: string, userRole: Role) {
    const task = await this.prisma.task.findUnique({
      where: { id },
      include: TASK_INCLUDE,
    });
    if (!task) throw new NotFoundException(`Task ${id} not found`);
    await this.assertAccess(task.projectId, userId, userRole);
    return task;
  }

  async update(id: string, dto: UpdateTaskDto, userId: string, userRole: Role) {
    const task = await this.prisma.task.findUnique({ where: { id } });
    if (!task) throw new NotFoundException(`Task ${id} not found`);
    await this.assertAccess(task.projectId, userId, userRole);

    // If not admin/manager, only assignee or creator can update
    if (
      userRole !== Role.ADMIN &&
      userRole !== Role.DESIGN_MANAGER &&
      task.creatorId !== userId &&
      task.assigneeId !== userId
    ) {
      throw new ForbiddenException('Only the creator or assignee can update this task');
    }

    const completedAt =
      dto.status === 'DONE' && task.status !== 'DONE'
        ? new Date()
        : dto.status && dto.status !== 'DONE'
          ? null
          : undefined;

    return this.prisma.task.update({
      where: { id },
      data: {
        ...dto,
        dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined,
        ...(completedAt !== undefined ? { completedAt } : {}),
      },
      include: TASK_INCLUDE,
    });
  }

  async remove(id: string, userId: string, userRole: Role) {
    const task = await this.prisma.task.findUnique({ where: { id } });
    if (!task) throw new NotFoundException(`Task ${id} not found`);
    await this.assertAccess(task.projectId, userId, userRole);

    if (
      userRole !== Role.ADMIN &&
      userRole !== Role.DESIGN_MANAGER &&
      task.creatorId !== userId
    ) {
      throw new ForbiddenException('Only the creator can delete this task');
    }

    await this.prisma.task.delete({ where: { id } });
    return { message: 'Task deleted' };
  }

  async addComment(taskId: string, dto: CreateCommentDto, userId: string, userRole: Role) {
    const task = await this.prisma.task.findUnique({ where: { id: taskId } });
    if (!task) throw new NotFoundException(`Task ${taskId} not found`);
    await this.assertAccess(task.projectId, userId, userRole);

    return this.prisma.comment.create({
      data: { content: dto.content, taskId, userId },
      include: {
        user: { select: { id: true, firstName: true, lastName: true, avatar: true } },
      },
    });
  }

  async deleteComment(commentId: string, userId: string, userRole: Role) {
    const comment = await this.prisma.comment.findUnique({
      where: { id: commentId },
      include: { task: true },
    });
    if (!comment) throw new NotFoundException('Comment not found');

    if (userRole !== Role.ADMIN && comment.userId !== userId) {
      throw new ForbiddenException('You can only delete your own comments');
    }

    await this.prisma.comment.delete({ where: { id: commentId } });
    return { message: 'Comment deleted' };
  }

  // ── Helpers ────────────────────────────────────────────────────────────────

  private async assertAccess(projectId: string, userId: string, userRole: Role) {
    if (userRole === Role.ADMIN) return;

    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
      include: { members: true },
    });
    if (!project) throw new NotFoundException(`Project ${projectId} not found`);

    const isMember = project.members.some((m) => m.userId === userId);
    const isOwner = project.ownerId === userId;

    if (!isMember && !isOwner) {
      throw new ForbiddenException('You do not have access to this project');
    }
  }
}
