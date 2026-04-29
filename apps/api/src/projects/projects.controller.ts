import {
  Controller, Get, Post, Patch, Delete,
  Param, Body, UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { ProjectsService } from './projects.service';
import { CreateProjectDto, UpdateProjectDto, AddMemberDto } from './dto/project.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';

@ApiTags('projects')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Post()
  @Roles(Role.ADMIN, Role.DESIGN_MANAGER)
  @ApiOperation({ summary: 'Create a new project' })
  create(
    @Body() dto: CreateProjectDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.projectsService.create(dto, userId);
  }

  @Get()
  @ApiOperation({ summary: 'List projects visible to the current user' })
  findAll(
    @CurrentUser('id') userId: string,
    @CurrentUser('role') userRole: Role,
  ) {
    return this.projectsService.findAll(userId, userRole);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get full project details' })
  findOne(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @CurrentUser('role') userRole: Role,
  ) {
    return this.projectsService.findOne(id, userId, userRole);
  }

  @Patch(':id')
  @Roles(Role.ADMIN, Role.DESIGN_MANAGER)
  @ApiOperation({ summary: 'Update project details' })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateProjectDto,
    @CurrentUser('id') userId: string,
    @CurrentUser('role') userRole: Role,
  ) {
    return this.projectsService.update(id, dto, userId, userRole);
  }

  @Delete(':id')
  @Roles(Role.ADMIN, Role.DESIGN_MANAGER)
  @ApiOperation({ summary: 'Delete a project' })
  remove(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @CurrentUser('role') userRole: Role,
  ) {
    return this.projectsService.remove(id, userId, userRole);
  }

  @Post(':id/members')
  @Roles(Role.ADMIN, Role.DESIGN_MANAGER)
  @ApiOperation({ summary: 'Add a member to the project' })
  addMember(
    @Param('id') projectId: string,
    @Body() dto: AddMemberDto,
    @CurrentUser('id') userId: string,
    @CurrentUser('role') userRole: Role,
  ) {
    return this.projectsService.addMember(projectId, dto, userId, userRole);
  }

  @Delete(':id/members/:memberId')
  @Roles(Role.ADMIN, Role.DESIGN_MANAGER)
  @ApiOperation({ summary: 'Remove a member from the project' })
  removeMember(
    @Param('id') projectId: string,
    @Param('memberId') memberId: string,
    @CurrentUser('id') userId: string,
    @CurrentUser('role') userRole: Role,
  ) {
    return this.projectsService.removeMember(projectId, memberId, userId, userRole);
  }
}
