import {
  Body,
  Controller,
  Post,
  UseGuards,
  HttpCode,
  Get,
  Query,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import {
  GetKeysDto,
  GoogleLoginDto,
  LoginDto,
  RegisterDto,
  ResendVerificationDto,
  VerifyEmailDto,
  ChangePasswordDto,
} from './dtos/auth.dto';
import { LinkedInProfileDto } from './dtos/linkedin-profile.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { GetUser, RequestUser } from './decorators/user.decorator';
import { JWTAuthGuard } from './guards/jwt-auth.guard';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Post('login')
  @HttpCode(200)
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Post('google')
  async googleSignIn(@Body() googleLoginDto: GoogleLoginDto) {
    return await this.authService.googleSignIn(googleLoginDto.idToken);
  }

  @Post('linkedin-profile')
  @UseGuards(JWTAuthGuard)
  async updateLinkedInProfile(
    @Body() linkedInProfileDto: LinkedInProfileDto,
    @GetUser() user: RequestUser,
  ) {
    return await this.authService.updateLinkedInProfile(
      linkedInProfileDto,
      user.id,
    );
  }

  @Post('resend-verification')
  async resendVerification(@Body() resendDto: ResendVerificationDto) {
    return await this.authService.resendVerification(resendDto);
  }

  @Post('github')
  @UseGuards(JWTAuthGuard)
  async githubAuth(@Body('code') code: string, @GetUser() user: RequestUser) {
    return await this.authService.githubAuth(code, user.id);
  }

  @Post('keys')
  @UseGuards(JWTAuthGuard)
  @ApiBearerAuth()
  async getKeys(@GetUser() user: RequestUser, @Body() body: GetKeysDto) {
    return await this.authService.getKey(user.id, body.modelName);
  }

  @Get('verify')
  async verifyEmail(@Query() verifyEmailDto: VerifyEmailDto) {
    return await this.authService.verifyEmail(verifyEmailDto);
  }

  @Post('change-password')
  @UseGuards(JWTAuthGuard)
  @ApiBearerAuth()
  async changePassword(
    @Body() changePasswordDto: ChangePasswordDto,
    @GetUser() user: RequestUser,
  ) {
    return await this.authService.changePassword(changePasswordDto, user.id);
  }
}
