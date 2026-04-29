import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ProjectStatus, Role } from '@prisma/client';
import {
  IsString, IsOptional, IsEnum, IsDateString,
  IsNumber, IsPositive, IsNotEmpty,
} from 'class-validator';

export class CreateProjectDto {
  @ApiProperty({ example: 'Horizon Tower – Commercial Fit-Out' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({ example: 'Full interior fit-out of floors 12–18.' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ enum: ProjectStatus, default: ProjectStatus.PLANNING })
  @IsOptional()
  @IsEnum(ProjectStatus)
  status?: ProjectStatus;

  @ApiPropertyOptional({ example: '2025-01-15' })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({ example: '2025-08-30' })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiPropertyOptional({ example: 2400000 })
  @IsOptional()
  @IsNumber()
  @IsPositive()
  budget?: number;

  @ApiPropertyOptional({ example: 'Dubai, UAE' })
  @IsOptional()
  @IsString()
  location?: string;

  @ApiPropertyOptional({ example: 'Horizon Holdings Ltd.' })
  @IsOptional()
  @IsString()
  clientName?: string;
}

export class UpdateProjectDto {
  @ApiPropertyOptional({ example: 'Updated Project Name' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ enum: ProjectStatus })
  @IsOptional()
  @IsEnum(ProjectStatus)
  status?: ProjectStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @IsPositive()
  budget?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  spent?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  location?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  clientName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  thumbnail?: string;
}

export class AddMemberDto {
  @ApiProperty({ example: 'cuid-of-the-user' })
  @IsString()
  @IsNotEmpty()
  userId: string;

  @ApiProperty({ enum: Role, default: Role.VIEWER })
  @IsEnum(Role)
  role: Role;
}
