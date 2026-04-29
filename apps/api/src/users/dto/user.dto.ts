import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import {
  IsEmail,
  IsString,
  IsOptional,
  IsEnum,
  IsBoolean,
  IsPhoneNumber,
} from 'class-validator';

export class UpdateUserDto {
  @ApiPropertyOptional({ example: 'John' })
  @IsOptional()
  @IsString()
  firstName?: string;

  @ApiPropertyOptional({ example: 'Doe' })
  @IsOptional()
  @IsString()
  lastName?: string;

  @ApiPropertyOptional({ example: '+971501234567' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({ example: 'https://cdn.example.com/avatar.jpg' })
  @IsOptional()
  @IsString()
  avatar?: string;
}

export class UpdateUserRoleDto {
  @ApiProperty({ enum: Role, example: Role.DESIGN_MANAGER })
  @IsEnum(Role)
  role: Role;
}

export class UpdateUserStatusDto {
  @ApiProperty({ example: true })
  @IsBoolean()
  isActive: boolean;
}
