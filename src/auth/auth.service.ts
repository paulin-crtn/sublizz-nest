import {
  BadRequestException,
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { User } from '@prisma/client';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'src/prisma/prisma.service';
import { MailService } from 'src/mail/mail.service';
import { SignInDto, SignUpDto } from './dto';
import validate from 'deep-email-validator';
import * as argon from 'argon2';
import * as randomToken from 'rand-token';

@Injectable()
export class AuthService {
  constructor(
    private prismaService: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
    private mailService: MailService,
  ) {}

  /**
   * Sign up new user
   *
   * @param dto
   * @returns
   */
  async signUp(dto: SignUpDto): Promise<void> {
    // Validates email addresses based on regex, common typos,
    // disposable email blacklists, DNS records and SMTP server response.
    const res = await validate({
      email: dto.email,
      sender: dto.email,
      validateRegex: true,
      validateMx: true,
      validateTypo: true,
      validateDisposable: true,
      validateSMTP: false, // Timeout issue
    });
    if (!res.valid) {
      throw new BadRequestException('Email is not valid.');
    }
    // Generate the password hash
    const passwordHash = await argon.hash(dto.password);
    try {
      // Save the new user in the db
      const user = await this.prismaService.user.create({
        data: {
          firstName: dto.firstName,
          email: dto.email,
          passwordHash,
        },
      });
      // Send a verification email to user
      const emailVerificationToken = randomToken.generate(16);
      await this.storeEmailVerificationToken(user, emailVerificationToken);
      await this.mailService.sendUserConfirmation(user, emailVerificationToken);
    } catch (error) {
      // Catch unique constraint violation error
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ConflictException('Email already taken.');
        }
      }
      throw error;
    }
  }

  /**
   * Sign in a user
   *
   * @param dto
   * @returns
   */
  async signIn(dto: SignInDto): Promise<{
    accessToken: string;
    refreshToken: string;
  }> {
    // Find the user by email
    const user = await this.prismaService.user.findUnique({
      where: {
        email: dto.email,
      },
    });
    // If user does not exist throw exception
    if (!user) {
      throw new UnauthorizedException('Email does not exist.');
    }
    // Compare password
    const isPasswordCorrect = await argon.verify(
      user.passwordHash,
      dto.password,
    );
    // If password incorrect throw exception
    if (!isPasswordCorrect) {
      throw new UnauthorizedException('Incorrect password.');
    }
    // Generate tokens
    const [accessToken, refreshToken] = await Promise.all([
      this.issueAccessToken(user.id, user.email),
      this.issueRefreshToken(user.id),
    ]);
    // Return tokens
    return { accessToken, refreshToken };
  }

  /**
   * Check the refresh token and issue new tokens
   *
   * @param user
   * @returns
   */
  async refreshTokens(
    user: User,
  ): Promise<{ accessToken: string; newRefreshToken: string }> {
    // Generate new tokens
    const [accessToken, newRefreshToken] = await Promise.all([
      this.issueAccessToken(user.id, user.email),
      this.issueRefreshToken(user.id),
    ]);
    // Return new tokens
    return { accessToken, newRefreshToken };
  }

  /**
   * Issue an access token
   *
   * @param userId
   * @param email
   * @returns
   */
  async issueAccessToken(userId: number, email: string): Promise<string> {
    // Payload
    const payload = {
      sub: userId,
      email,
    };
    // JWT access token
    return await this.jwtService.signAsync(payload, {
      expiresIn: '15m',
      secret: this.configService.get('ACCESS_JWT_SECRET'),
    });
  }

  /**
   * Issue a refresh token
   *
   * @param userId
   */
  async issueRefreshToken(userId: number): Promise<string> {
    // Generate the refresh token
    const refreshToken = randomToken.generate(32);
    const refreshTokenHash = await argon.hash(refreshToken);
    // Save the refresh token hash
    await this.prismaService.user.update({
      where: {
        id: userId,
      },
      data: {
        refreshTokenHash,
      },
    });
    // Payload
    const payload = {
      sub: userId,
      refreshToken,
    };
    // JWT refresh token
    return await this.jwtService.signAsync(payload, {
      expiresIn: '1w',
      secret: this.configService.get('REFRESH_JWT_SECRET'),
    });
  }

  /**
   * Log out a user
   *
   * @param userId
   */
  async logout(userId: number) {
    await this.prismaService.user.update({
      where: {
        id: userId,
      },
      data: {
        refreshTokenHash: null,
      },
    });
  }

  /**
   * Get verification email token
   *
   * @param user
   */
  async storeEmailVerificationToken(user: User, token: string): Promise<void> {
    const emailVerificationTokenHash = await argon.hash(token);
    await this.prismaService.emailVerification.create({
      data: {
        userId: user.id,
        email: user.email,
        tokenHash: emailVerificationTokenHash,
      },
    });
  }
}
