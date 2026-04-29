import { Controller, Get, Post, Patch, Delete, Param, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { MilestonesService } from './milestones.service';
import { CreateMilestoneDto, UpdateMilestoneDto } from './dto/milestone.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('milestones')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('projects/:projectId/milestones')
export class MilestonesController {
  constructor(private readonly milestonesService: MilestonesService) {}

  @Post()
  @ApiOperation({ summary: 'Create milestone within a project' })
  create(
    @Param('projectId') projectId: string,
    @Body() dto: CreateMilestoneDto,
    @CurrentUser('id') userId: string,
    @CurrentUser('role') userRole: Role,
  ) {
    return this.milestonesService.create(projectId, dto, userId, userRole);
  }

  @Get()
  @ApiOperation({ summary: 'List all milestones for a project' })
  findAll(
    @Param('projectId') projectId: string,
    @CurrentUser('id') userId: string,
    @CurrentUser('role') userRole: Role,
  ) {
    return this.milestonesService.findAllForProject(projectId, userId, userRole);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single milestone' })
  findOne(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @CurrentUser('role') userRole: Role,
  ) {
    return this.milestonesService.findOne(id, userId, userRole);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update milestone (status, dates, order)' })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateMilestoneDto,
    @CurrentUser('id') userId: string,
    @CurrentUser('role') userRole: Role,
  ) {
    return this.milestonesService.update(id, dto, userId, userRole);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a milestone' })
  remove(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @CurrentUser('role') userRole: Role,
  ) {
    return this.milestonesService.remove(id, userId, userRole);
  }
}
