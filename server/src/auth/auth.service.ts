import {
  Injectable,
  Logger,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
  HttpException,
} from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import * as crypto from 'crypto';
import {
  LoginDto,
  RegisterDto,
  ResendVerificationDto,
  VerifyEmailDto,
  ChangePasswordDto,
} from './dtos/auth.dto';
import { LinkedInProfileDto } from './dtos/linkedin-profile.dto';
import { JwtService } from '@nestjs/jwt';
import { Auth, google } from 'googleapis';
import { PrismaService } from 'src/prisma/prisma.service';
import { MailService } from 'src/mail/mail.service';
import axios from 'axios';
import { EncryptionService } from 'src/utils/encrypt.service';
import { EMAIL_VERIFICATION_TEMPLATE } from 'src/mail/templates/email-verification';
import { FeatureFlag, FeatureFlagsService } from 'src/feature-flags';
import { emailTemplateWrapper } from 'src/mail/templates/wrapper';
import { SIGNUP_WELCOME_EMAIL } from 'src/mail/templates/waitlist';
import { users } from '@prisma/client';

@Injectable()
export class AuthService {
  private oauth2Client: Auth.OAuth2Client;
  logger = new Logger(AuthService.name);

  constructor(
    private readonly jwtService: JwtService,
    private readonly prismaService: PrismaService,
    private readonly encryptionService: EncryptionService,
    private readonly mailService: MailService,
    private readonly featureFlagsService: FeatureFlagsService,
  ) {
    this.oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_CALLBACK_URL,
    );
  }

  async googleSignIn(idToken: string) {
    try {
      const ticket = await this.oauth2Client.verifyIdToken({
        idToken,
        audience: process.env.GOOGLE_CLIENT_ID,
      });

      const payload = ticket.getPayload();
      const {
        email,
        sub: googleId,
        given_name,
        family_name,
        picture,
      } = payload;

      // Check if the user exists in the database
      let user = await this.prismaService.users.findFirst({
        where: { email },
      });

      if (!user) {
        // Check if email is admin or in waitlist
        if (
          await this.featureFlagsService.isFeatureEnabled(
            FeatureFlag.IS_WAITLIST_NEEDED,
          )
        ) {
          const waitlist = await this.prismaService.waitlist.findFirst({
            where: { email },
            select: {
              status: true,
            },
          });
          if (!waitlist) {
            throw new UnauthorizedException(
              'Please join the waitlist to access the app',
            );
          }

          if (waitlist.status !== 'APPROVED') {
            throw new UnauthorizedException('You are still on the waitlist.');
          }
        }

        user = await this.prismaService.users.create({
          data: {
            email: email,
            first_name: given_name ?? '',
            last_name: family_name ?? '',
            avatar_url: picture,
          },
        });

        const jwtPayload = {
          id: user.id,
          email,
          sub: googleId,
          role: user.is_super_admin ? 'admin' : 'user',
          // workspaceId: newWorksapce.id,
          avatar_url: user?.avatar_url,
        };
        const token = await this.jwtService.signAsync(jwtPayload, {
          expiresIn: process.env.JWT_EXPIRATION ?? '10d',
        });

        this.mailService.sendTemplateMail({
          to: user.email,
          subject: 'Welcome to Heizen',
          template: emailTemplateWrapper(SIGNUP_WELCOME_EMAIL),
          context: {
            name: user.first_name,
          },
        });
        return {
          token,
          is_new: true,
          user: {
            id: user.id,
            role: user.is_super_admin ? 'admin' : 'user',
            avatar_url: user?.avatar_url,
            first_name: user.first_name,
            last_name: user.last_name,
            email: user.email,
          },
        };
      }

      const jwtPayload = {
        id: user.id,
        email,
        sub: googleId,
        role: user.is_super_admin ? 'admin' : 'user',
        avatar_url: user?.avatar_url,
      };

      const token = await this.jwtService.signAsync(jwtPayload, {
        expiresIn: process.env.JWT_EXPIRATION ?? '10d',
      });
      return {
        token,
        is_new: false,
        user: {
          id: user.id,
          role: user.is_super_admin ? 'admin' : 'user',
          avatar_url: user?.avatar_url,
          first_name: user.first_name,
          last_name: user.last_name,
          email: user.email,
        },
      };
    } catch (error) {
      this.logger.error(error);
      throw error;
    }
  }

  private generateVerificationToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  private async sendVerificationEmail(user: users, token: string) {
    const verificationLink = `${process.env.NEXT_PUBLIC_APP_URL}/auth/verify?token=${token}`;

    await this.mailService.sendTemplateMail({
      to: user.email,
      subject: 'Verify Your Email Address',
      template: emailTemplateWrapper(EMAIL_VERIFICATION_TEMPLATE),
      context: {
        firstName: user.first_name,
        verificationLink,
      },
    });
  }

  async register(registerDto: RegisterDto) {
    try {
      // Check if user already exists
      const existingUser = await this.prismaService.users.findFirst({
        where: { email: registerDto.email },
      });

      if (existingUser) {
        throw new ConflictException('User with this email already exists');
      }

      // Check if email is admin or in waitlist
      if (
        await this.featureFlagsService.isFeatureEnabled(
          FeatureFlag.IS_WAITLIST_NEEDED,
        )
      ) {
        const waitlist = await this.prismaService.waitlist.findFirst({
          where: { email: registerDto.email },
          select: {
            status: true,
          },
        });
        if (!waitlist) {
          throw new UnauthorizedException(
            'Please join the waitlist to access the app',
          );
        }

        if (waitlist.status !== 'APPROVED') {
          throw new UnauthorizedException(
            'You are still on the waitlist. We will reach out to you once the admin approves your access',
          );
        }
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(registerDto.password, 10);

      // Generate verification token
      const verificationToken = this.generateVerificationToken();
      const verificationExpiry = new Date();
      verificationExpiry.setHours(verificationExpiry.getHours() + 24); // 24 hours expiry

      // Create user
      const user = await this.prismaService.users.create({
        data: {
          email: registerDto.email,
          password: hashedPassword,
          first_name: registerDto.first_name,
          last_name: registerDto.last_name,
          linkedin_profile_url: registerDto.linkedin_profile_url,
          verification_token: verificationToken,
          verification_expiry: verificationExpiry,
        },
      });

      // Send verification email
      await this.sendVerificationEmail(user, verificationToken);

      return {
        ...user,
        password: undefined,
        verification_token: undefined,
        verification_expiry: undefined,
      };
    } catch (error) {
      this.logger.error(error);
      throw error;
    }
  }

  async verifyEmail(verifyEmailDto: VerifyEmailDto) {
    try {
      const user = await this.prismaService.users.findFirst({
        where: {
          verification_token: verifyEmailDto.token,
          verification_expiry: {
            gt: new Date(),
          },
        },
      });

      if (!user) {
        throw new BadRequestException('Invalid or expired verification token');
      }

      // Update user verification status
      await this.prismaService.users.update({
        where: { id: user.id },
        data: {
          is_verified: true,
          verification_token: null,
          verification_expiry: null,
        },
      });

      this.mailService.sendTemplateMail({
        to: user.email,
        subject: 'Welcome to Heizen',
        template: emailTemplateWrapper(SIGNUP_WELCOME_EMAIL),
        context: {
          name: user.first_name,
        },
      });

      return { ...user, password: undefined };
    } catch (error) {
      this.logger.error(error);
      throw error;
    }
  }

  async resendVerification(resendDto: ResendVerificationDto) {
    try {
      const user = await this.prismaService.users.findFirst({
        where: { email: resendDto.email },
      });

      if (!user) {
        throw new BadRequestException('User not found');
      }

      if (user.is_verified) {
        throw new BadRequestException('Email is already verified');
      }

      // Generate new verification token
      const verificationToken = this.generateVerificationToken();
      const verificationExpiry = new Date();
      verificationExpiry.setHours(verificationExpiry.getHours() + 24);

      // Update user with new verification token
      await this.prismaService.users.update({
        where: { id: user.id },
        data: {
          verification_token: verificationToken,
          verification_expiry: verificationExpiry,
        },
      });

      // Send new verification email
      await this.sendVerificationEmail(user, verificationToken);

      return true;
    } catch (error) {
      this.logger.error(error);
      throw error;
    }
  }

  async login(loginDto: LoginDto) {
    try {
      const user = await this.prismaService.users.findFirst({
        where: { email: loginDto.email },
      });

      if (!user || !user.password) {
        throw new UnauthorizedException('Invalid credentials');
      }

      if (!user.is_verified) {
        throw new UnauthorizedException(
          'Please verify your email before logging in',
        );
      }

      const isPasswordValid = await bcrypt.compare(
        loginDto.password,
        user.password,
      );

      if (!isPasswordValid) {
        throw new UnauthorizedException('Invalid credentials');
      }

      const jwtPayload = {
        id: user.id,
        email: user.email,
        role: user.is_super_admin ? 'admin' : 'user',
        avatar_url: user?.avatar_url,
      };

      const token = await this.jwtService.signAsync(jwtPayload, {
        expiresIn: process.env.JWT_EXPIRATION ?? '10d',
      });

      return {
        token,
        user: {
          id: user.id,
          role: user.is_super_admin ? 'admin' : 'user',
          avatar_url: user?.avatar_url,
          first_name: user.first_name,
          last_name: user.last_name,
          email: user.email,
        },
      };
    } catch (error) {
      this.logger.error(error);
      throw error;
    }
  }

  async githubAuth(code: string, userId: string) {
    try {
      const tokenResponse = await axios.post(
        'https://github.com/login/oauth/access_token',
        {
          client_id: process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID,
          client_secret: process.env.GITHUB_CLIENT_SECRET,
          code,
        },
        {
          headers: {
            Accept: 'application/json',
          },
        },
      );

      const { access_token } = tokenResponse.data;
      const encryptedToken = this.encryptionService.encrypt(access_token);
      await this.prismaService.users.update({
        where: { id: userId },
        data: { github_access_token: encryptedToken },
      });

      return true;
    } catch (error) {
      console.log(error);
      throw new UnauthorizedException('Failed to authenticate with GitHub');
    }
  }
  async checkIfCreditExists(userId: string) {
    const user = await this.prismaService.users.findUnique({
      where: {
        id: userId,
      },
    });
    if (!user) {
      throw new HttpException('User not found', 404);
    }
    if (user.credits_remaining && user.credits_remaining > 0) {
      return true;
    }
    return false;
  }
  async updateLinkedInProfile(
    linkedInProfileDto: LinkedInProfileDto,
    userId: string,
  ) {
    try {
      const user = await this.prismaService.users.update({
        where: { id: userId },
        data: {
          linkedin_profile_url: linkedInProfileDto.linkedin_profile_url,
        },
      });

      return {
        id: user.id,
        role: user.is_super_admin ? 'admin' : 'user',
        avatar_url: user?.avatar_url,
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        linkedin_profile_url: user.linkedin_profile_url,
      };
    } catch (error) {
      this.logger.error(error);
      throw error;
    }
  }

  async getKey(userId: string, modelId: string) {
    switch (modelId) {
      case 'opengig-coder':
        if (!(await this.checkIfCreditExists(userId))) {
          throw new HttpException('No credits remaining', 400);
        }
        return {
          key: process.env.OPENGIG_CODER_KEY,
        };
      case 'opengig-long-context':
        if (!(await this.checkIfCreditExists(userId))) {
          throw new HttpException('No credits remaining', 400);
        }
        return {
          key: process.env.OPENGIG_LONG_CONTEXT_KEY,
        };
      default:
        throw new HttpException('Wrong Model Name', 400);
    }
  }

  async changePassword(changePasswordDto: ChangePasswordDto, userId: string) {
    try {
      // Validate that new password and confirm password match
      if (changePasswordDto.newPassword !== changePasswordDto.confirmPassword) {
        throw new BadRequestException(
          'New password and confirm password do not match',
        );
      }

      // Get user from database
      const user = await this.prismaService.users.findUnique({
        where: { id: userId },
      });

      if (!user || !user.password) {
        throw new BadRequestException(
          'User not found or no password set! Please signin with google',
        );
      }

      // Verify current password
      const isCurrentPasswordValid = await bcrypt.compare(
        changePasswordDto.currentPassword,
        user.password,
      );

      if (!isCurrentPasswordValid) {
        throw new UnauthorizedException('Current password is incorrect');
      }

      // Hash new password
      const hashedNewPassword = await bcrypt.hash(
        changePasswordDto.newPassword,
        10,
      );

      // Update password in database
      await this.prismaService.users.update({
        where: { id: userId },
        data: { password: hashedNewPassword },
      });

      return true;
    } catch (error) {
      this.logger.error(error);
      throw error;
    }
  }
}
