import { IsNotEmpty, IsString, IsUrl } from 'class-validator';

export class LinkedInProfileDto {
  @IsString()
  @IsNotEmpty()
  @IsUrl()
  linkedin_profile_url: string;
}
