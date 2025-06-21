import { project_members, users } from '@prisma/client';
import { ProjectMemberDto } from '../dtos/ProjectMemberDto.dto';
type FullProjectMember = project_members & {
  users?: Partial<users>;
};
export const mapToProjectMemberDto = (
  member: Partial<FullProjectMember>,
): ProjectMemberDto => {
  return {
    id: member.id,
    projectId: member.project_id,
    role: member.role,
    createdAt: member.created_at,
    updatedAt: member.updated_at,
    email: member.user_email || null,
    userId: member.users?.id || null,
    firstName: member.users?.first_name || null,
    lastName: member.users?.last_name || null,
    avatarUrl: member.users?.avatar_url || null,
  };
};
