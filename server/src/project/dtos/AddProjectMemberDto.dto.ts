import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class AddProjectMemberDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  role: string;
}
