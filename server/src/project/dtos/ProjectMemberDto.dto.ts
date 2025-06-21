import { MemberRole } from '@prisma/client';
import { IsString, IsDate, IsEnum } from 'class-validator';

export class ProjectMemberDto {
  @IsString()
  id: string;

  @IsString()
  projectId: string;

  @IsString()
  userId: string;

  @IsString()
  role: string;

  @IsDate()
  createdAt: Date;

  @IsDate()
  updatedAt: Date;

  @IsString()
  email: string;

  @IsString()
  firstName: string;

  @IsString()
  lastName: string;

  @IsString()
  avatarUrl?: string;
}

export class UpdateMemberRoleDto {
  @IsEnum(MemberRole)
  role: MemberRole;
}
