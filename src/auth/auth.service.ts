/* -------------------------------------------------------------------------- */
/*                                   IMPORTS                                  */
/* -------------------------------------------------------------------------- */
import {
  BadRequestException,
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EmailVerification, PasswordReset, prisma, User } from '@prisma/client';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'src/prisma/prisma.service';
import { MailService } from 'src/mail/mail.service';
import { PasswordResetDto, SignInDto, SignUpDto } from './dto';
import validate from 'deep-email-validator';
import * as argon from 'argon2';
import * as randomToken from 'rand-token';
import { UserService } from 'src/user/user.service';

/* -------------------------------------------------------------------------- */
/*                             AUTH SERVICE CLASS                             */
/* -------------------------------------------------------------------------- */
@Injectable()
export class AuthService {
  constructor(
    private configService: ConfigService,
    private prismaService: PrismaService,
    private jwtService: JwtService,
    private userService: UserService,
    private mailService: MailService,
  ) {}

  /* -------------------------------------------------------------------------- */
  /*                              PUBLIC FUNCTIONS                              */
  /* -------------------------------------------------------------------------- */

  /**
   * Sign up new user
   *
   * @param dto
   * @returns
   */
  async signUp(dto: SignUpDto): Promise<void> {
    // Validate email
    this._validateEmail(dto.email);
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
      const token = randomToken.generate(16);
      const emailVerification = await this._storeEmailVerificationToken(
        user,
        token,
      );
      await this.mailService.sendUserEmailVerificationToken(
        user,
        token,
        emailVerification.id,
      );
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
    const user = await this.userService.findUserByEmail(dto.email);
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
      this._issueAccessToken(user.id, user.email),
      this._issueRefreshToken(user.id),
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
      this._issueAccessToken(user.id, user.email),
      this._issueRefreshToken(user.id),
    ]);
    // Return new tokens
    return { accessToken, newRefreshToken };
  }

  /**
   * Log out a user
   *
   * @param userId
   */
  async logout(userId: number): Promise<void> {
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
   * Confirm user email
   *
   * @param emailVerificationId
   * @param token
   */
  async confirmUserEmail(
    emailVerificationId: number,
    token: string,
  ): Promise<{ userEmail: string }> {
    // Find email verification
    const emailVerification =
      await this.prismaService.emailVerification.findUnique({
        where: {
          id: emailVerificationId,
        },
      });
    // If email verification does not exist throw exception
    if (!emailVerification) {
      throw new UnauthorizedException('Email verification id does not exist.');
    }
    // Compare token
    const isTokenCorrect = await argon.verify(
      emailVerification.tokenHash,
      token,
    );
    // If token incorrect throw exception
    if (!isTokenCorrect) {
      throw new UnauthorizedException('Incorrect token.');
    }
    // Update user
    await this.prismaService.user.update({
      where: {
        id: emailVerification.userId,
      },
      data: {
        email: emailVerification.email,
        emailVerifiedAt: new Date(Date.now()),
      },
    });
    return { userEmail: emailVerification.email };
  }

  /**
   * Issue password reset token
   *
   * @param email
   */
  async issuePasswordResetToken(email: string): Promise<void> {
    // Validate email
    this._validateEmail(email);
    // Find the user by email
    const user = await this.userService.findUserByEmail(email);
    // Generate and store reset password token
    const token = randomToken.generate(16);
    await this._storePasswordResetToken(user.email, token);
    // Send token to user's email
    await this.mailService.sendUserResetPasswordToken(user, token);
  }

  /**
   * Reset user password
   *
   * @param dto
   */
  async resetUserPassword(dto: PasswordResetDto) {
    // Find PasswordReset
    const passwordReset = await this.prismaService.passwordReset.findFirst({
      where: {
        userEmail: dto.email,
      },
      orderBy: { createdAt: 'desc' },
    });
    // If PasswordReset does not exist throw exception
    if (!passwordReset) {
      throw new UnauthorizedException('No password reset asked.');
    }
    // Compare token
    const isTokenCorrect = await argon.verify(
      passwordReset.tokenHash,
      dto.token,
    );
    // If token incorrect throw exception
    if (!isTokenCorrect) {
      throw new UnauthorizedException('Incorrect token.');
    }
    // If token expired throw exception
    const isExpired =
      passwordReset.createdAt < new Date(Date.now() - 15 * 60 * 1000); // 15 min
    if (isExpired) {
      await this.prismaService.passwordReset.delete({
        where: { id: passwordReset.id },
      });
      throw new UnauthorizedException('Token has expired.');
    }
    // Update user password
    const passwordHash = await argon.hash(dto.password);
    await this.userService.updateUserByEmail(dto.email, { passwordHash });
    // Delete PasswordReset
    await this.prismaService.passwordReset.delete({
      where: { id: passwordReset.id },
    });
  }

  /* -------------------------------------------------------------------------- */
  /*                              PRIVATE FUNCTIONS                             */
  /* -------------------------------------------------------------------------- */
  /**
   * Issue an access token
   *
   * @param userId
   * @param email
   * @returns
   */
  private async _issueAccessToken(
    userId: number,
    email: string,
  ): Promise<string> {
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
  private async _issueRefreshToken(userId: number): Promise<string> {
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
   * Store email verification token
   *
   * @param user
   * @param token
   */
  private async _storeEmailVerificationToken(
    user: User,
    token: string,
  ): Promise<EmailVerification> {
    const emailVerificationTokenHash = await argon.hash(token);
    return await this.prismaService.emailVerification.create({
      data: {
        userId: user.id,
        email: user.email,
        tokenHash: emailVerificationTokenHash,
      },
    });
  }

  /**
   * Store password reset token
   *
   * @param email
   * @param token
   * @returns
   */
  private async _storePasswordResetToken(
    email: string,
    token: string,
  ): Promise<PasswordReset> {
    const passwordResetTokenHash = await argon.hash(token);
    return await this.prismaService.passwordReset.create({
      data: {
        userEmail: email,
        tokenHash: passwordResetTokenHash,
      },
    });
  }

  /**
   * Validates email addresses based on regex, common typos,
   * disposable email blacklists, DNS records and SMTP server response.
   *
   * @param email
   */
  private async _validateEmail(email: string) {
    const res = await validate({
      email,
      sender: email,
      validateRegex: true,
      validateMx: true,
      validateTypo: true,
      validateDisposable: true,
      validateSMTP: false, // Timeout issue
    });
    if (!res.valid) {
      throw new BadRequestException('Email is not valid.');
    }
  }
}
