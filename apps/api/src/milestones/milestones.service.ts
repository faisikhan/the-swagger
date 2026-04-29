import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMilestoneDto, UpdateMilestoneDto } from './dto/milestone.dto';
import { Role } from '@prisma/client';

@Injectable()
export class MilestonesService {
  constructor(private prisma: PrismaService) {}

  async create(projectId: string, dto: CreateMilestoneDto, userId: string, userRole: Role) {
    await this.assertProjectAccess(projectId, userId, userRole, true);

    return this.prisma.milestone.create({
      data: {
        ...dto,
        dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined,
        projectId,
      },
      include: {
        tasks: {
          include: {
            assignee: { select: { id: true, firstName: true, lastName: true, avatar: true } },
          },
        },
        _count: { select: { tasks: true } },
      },
    });
  }

  async findAllForProject(projectId: string, userId: string, userRole: Role) {
    await this.assertProjectAccess(projectId, userId, userRole, false);

    return this.prisma.milestone.findMany({
      where: { projectId },
      include: {
        tasks: {
          include: {
            assignee: { select: { id: true, firstName: true, lastName: true, avatar: true } },
          },
          orderBy: { createdAt: 'asc' },
        },
        _count: { select: { tasks: true } },
      },
      orderBy: { order: 'asc' },
    });
  }

  async findOne(id: string, userId: string, userRole: Role) {
    const milestone = await this.prisma.milestone.findUnique({
      where: { id },
      include: {
        project: true,
        tasks: {
          include: {
            assignee: { select: { id: true, firstName: true, lastName: true, avatar: true } },
            creator: { select: { id: true, firstName: true, lastName: true } },
          },
        },
      },
    });
    if (!milestone) throw new NotFoundException(`Milestone ${id} not found`);
    await this.assertProjectAccess(milestone.projectId, userId, userRole, false);
    return milestone;
  }

  async update(id: string, dto: UpdateMilestoneDto, userId: string, userRole: Role) {
    const milestone = await this.prisma.milestone.findUnique({ where: { id } });
    if (!milestone) throw new NotFoundException(`Milestone ${id} not found`);
    await this.assertProjectAccess(milestone.projectId, userId, userRole, true);

    // Auto-set completedAt when status flips to COMPLETED
    const completedAt =
      dto.status === 'COMPLETED' && milestone.status !== 'COMPLETED'
        ? new Date()
        : dto.status && dto.status !== 'COMPLETED'
          ? null
          : undefined;

    return this.prisma.milestone.update({
      where: { id },
      data: {
        ...dto,
        dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined,
        ...(completedAt !== undefined ? { completedAt } : {}),
      },
      include: { _count: { select: { tasks: true } } },
    });
  }

  async remove(id: string, userId: string, userRole: Role) {
    const milestone = await this.prisma.milestone.findUnique({ where: { id } });
    if (!milestone) throw new NotFoundException(`Milestone ${id} not found`);
    await this.assertProjectAccess(milestone.projectId, userId, userRole, true);

    await this.prisma.milestone.delete({ where: { id } });
    return { message: 'Milestone deleted' };
  }

  // ── Helpers ────────────────────────────────────────────────────────────────

  private async assertProjectAccess(
    projectId: string,
    userId: string,
    userRole: Role,
    requireManage: boolean,
  ) {
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

    if (requireManage && !isOwner && userRole !== Role.DESIGN_MANAGER) {
      throw new ForbiddenException('Only the owner or Design Manager can manage milestones');
    }
  }
}
