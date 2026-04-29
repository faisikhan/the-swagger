import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateUserDto, UpdateUserRoleDto, UpdateUserStatusDto } from './dto/user.dto';
import { Role } from '@prisma/client';

const USER_SELECT = {
  id: true,
  email: true,
  firstName: true,
  lastName: true,
  role: true,
  isActive: true,
  emailVerified: true,
  avatar: true,
  phone: true,
  createdAt: true,
  updatedAt: true,
  password: false,
} as const;

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.user.findMany({
      select: USER_SELECT,
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: USER_SELECT,
    });
    if (!user) throw new NotFoundException(`User ${id} not found`);
    return user;
  }

  async updateProfile(id: string, dto: UpdateUserDto, requesterId: string) {
    if (id !== requesterId) {
      throw new ForbiddenException('You can only update your own profile');
    }
    return this.prisma.user.update({
      where: { id },
      data: dto,
      select: USER_SELECT,
    });
  }

  async updateRole(id: string, dto: UpdateUserRoleDto) {
    await this.findOne(id);
    return this.prisma.user.update({
      where: { id },
      data: { role: dto.role },
      select: USER_SELECT,
    });
  }

  async updateStatus(id: string, dto: UpdateUserStatusDto) {
    await this.findOne(id);
    return this.prisma.user.update({
      where: { id },
      data: { isActive: dto.isActive },
      select: USER_SELECT,
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.user.delete({ where: { id } });
    return { message: 'User deleted successfully' };
  }
}
