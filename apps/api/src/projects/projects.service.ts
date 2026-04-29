import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProjectDto, UpdateProjectDto, AddMemberDto } from './dto/project.dto';
import { Role } from '@prisma/client';

const PROJECT_INCLUDE = {
  owner: {
    select: { id: true, firstName: true, lastName: true, email: true, avatar: true },
  },
  members: {
    include: {
      user: {
        select: { id: true, firstName: true, lastName: true, email: true, avatar: true, role: true },
      },
    },
  },
  _count: { select: { milestones: true, tasks: true, documents: true } },
} as const;

@Injectable()
export class ProjectsService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateProjectDto, ownerId: string) {
    const project = await this.prisma.project.create({
      data: {
        ...dto,
        startDate: dto.startDate ? new Date(dto.startDate) : undefined,
        endDate: dto.endDate ? new Date(dto.endDate) : undefined,
        ownerId,
      },
      include: PROJECT_INCLUDE,
    });

    // Auto-add owner as DESIGN_MANAGER member
    await this.prisma.projectMember.create({
      data: { projectId: project.id, userId: ownerId, role: Role.DESIGN_MANAGER },
    });

    return project;
  }

  async findAll(userId: string, userRole: Role) {
    // Admins see all; others see only their projects
    const where =
      userRole === Role.ADMIN
        ? {}
        : {
            OR: [
              { ownerId: userId },
              { members: { some: { userId } } },
            ],
          };

    return this.prisma.project.findMany({
      where,
      include: PROJECT_INCLUDE,
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string, userId: string, userRole: Role) {
    const project = await this.prisma.project.findUnique({
      where: { id },
      include: {
        ...PROJECT_INCLUDE,
        milestones: {
          include: { tasks: { include: { assignee: { select: { id: true, firstName: true, lastName: true, avatar: true } } } } },
          orderBy: { order: 'asc' },
        },
        tasks: {
          include: {
            assignee: { select: { id: true, firstName: true, lastName: true, avatar: true } },
            creator: { select: { id: true, firstName: true, lastName: true } },
            milestone: { select: { id: true, title: true } },
          },
          orderBy: { createdAt: 'desc' },
        },
        documents: { orderBy: { createdAt: 'desc' } },
        activityLogs: {
          include: { user: { select: { id: true, firstName: true, lastName: true, avatar: true } } },
          orderBy: { createdAt: 'desc' },
          take: 20,
        },
      },
    });

    if (!project) throw new NotFoundException(`Project ${id} not found`);
    this.assertAccess(project, userId, userRole);

    return project;
  }

  async update(id: string, dto: UpdateProjectDto, userId: string, userRole: Role) {
    const project = await this.prisma.project.findUnique({ where: { id } });
    if (!project) throw new NotFoundException(`Project ${id} not found`);
    this.assertManageAccess(project, userId, userRole);

    return this.prisma.project.update({
      where: { id },
      data: {
        ...dto,
        startDate: dto.startDate ? new Date(dto.startDate) : undefined,
        endDate: dto.endDate ? new Date(dto.endDate) : undefined,
      },
      include: PROJECT_INCLUDE,
    });
  }

  async remove(id: string, userId: string, userRole: Role) {
    const project = await this.prisma.project.findUnique({ where: { id } });
    if (!project) throw new NotFoundException(`Project ${id} not found`);
    this.assertManageAccess(project, userId, userRole);

    await this.prisma.project.delete({ where: { id } });
    return { message: 'Project deleted successfully' };
  }

  async addMember(projectId: string, dto: AddMemberDto, userId: string, userRole: Role) {
    const project = await this.prisma.project.findUnique({ where: { id: projectId } });
    if (!project) throw new NotFoundException(`Project ${projectId} not found`);
    this.assertManageAccess(project, userId, userRole);

    const existing = await this.prisma.projectMember.findUnique({
      where: { userId_projectId: { userId: dto.userId, projectId } },
    });
    if (existing) throw new ConflictException('User is already a member of this project');

    return this.prisma.projectMember.create({
      data: { projectId, userId: dto.userId, role: dto.role },
      include: {
        user: { select: { id: true, firstName: true, lastName: true, email: true, avatar: true } },
      },
    });
  }

  async removeMember(projectId: string, memberId: string, userId: string, userRole: Role) {
    const project = await this.prisma.project.findUnique({ where: { id: projectId } });
    if (!project) throw new NotFoundException(`Project ${projectId} not found`);
    this.assertManageAccess(project, userId, userRole);

    const member = await this.prisma.projectMember.findUnique({
      where: { userId_projectId: { userId: memberId, projectId } },
    });
    if (!member) throw new NotFoundException('Member not found in this project');

    await this.prisma.projectMember.delete({
      where: { userId_projectId: { userId: memberId, projectId } },
    });
    return { message: 'Member removed successfully' };
  }

  // ── Helpers ────────────────────────────────────────────────────────────────

  private assertAccess(project: any, userId: string, userRole: Role) {
    if (userRole === Role.ADMIN) return;
    const isMember = project.members?.some((m: any) => m.userId === userId);
    const isOwner = project.ownerId === userId;
    if (!isMember && !isOwner) {
      throw new ForbiddenException('You do not have access to this project');
    }
  }

  private assertManageAccess(project: any, userId: string, userRole: Role) {
    if (userRole === Role.ADMIN) return;
    if (project.ownerId !== userId && userRole !== Role.DESIGN_MANAGER) {
      throw new ForbiddenException('Only the project owner or a Design Manager can do this');
    }
  }
}
