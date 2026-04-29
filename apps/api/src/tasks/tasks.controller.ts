import { Controller, Get, Post, Patch, Delete, Param, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { TasksService } from './tasks.service';
import { CreateTaskDto, UpdateTaskDto, CreateCommentDto } from './dto/task.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('tasks')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('projects/:projectId/tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Post()
  @ApiOperation({ summary: 'Create a task within a project' })
  create(
    @Param('projectId') projectId: string,
    @Body() dto: CreateTaskDto,
    @CurrentUser('id') userId: string,
    @CurrentUser('role') userRole: Role,
  ) {
    return this.tasksService.create(projectId, dto, userId, userRole);
  }

  @Get()
  @ApiOperation({ summary: 'List all tasks for a project' })
  findAll(
    @Param('projectId') projectId: string,
    @CurrentUser('id') userId: string,
    @CurrentUser('role') userRole: Role,
  ) {
    return this.tasksService.findAllForProject(projectId, userId, userRole);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single task with comments' })
  findOne(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @CurrentUser('role') userRole: Role,
  ) {
    return this.tasksService.findOne(id, userId, userRole);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update task (status, assignee, priority…)' })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateTaskDto,
    @CurrentUser('id') userId: string,
    @CurrentUser('role') userRole: Role,
  ) {
    return this.tasksService.update(id, dto, userId, userRole);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a task' })
  remove(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @CurrentUser('role') userRole: Role,
  ) {
    return this.tasksService.remove(id, userId, userRole);
  }

  @Post(':id/comments')
  @ApiOperation({ summary: 'Add a comment to a task' })
  addComment(
    @Param('id') taskId: string,
    @Body() dto: CreateCommentDto,
    @CurrentUser('id') userId: string,
    @CurrentUser('role') userRole: Role,
  ) {
    return this.tasksService.addComment(taskId, dto, userId, userRole);
  }

  @Delete('comments/:commentId')
  @ApiOperation({ summary: 'Delete a comment' })
  deleteComment(
    @Param('commentId') commentId: string,
    @CurrentUser('id') userId: string,
    @CurrentUser('role') userRole: Role,
  ) {
    return this.tasksService.deleteComment(commentId, userId, userRole);
  }
}
